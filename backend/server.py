from fastapi import FastAPI, APIRouter, HTTPException, Request, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Payment configuration
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY", "sk_test_emergent")
APP_PRICE = 3.99  # One-time purchase price
APP_CURRENCY = "usd"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class PurchaseRequest(BaseModel):
    device_id: str
    origin_url: str

class PurchaseStatusResponse(BaseModel):
    purchased: bool
    purchase_date: Optional[str] = None
    transaction_id: Optional[str] = None

class WebhookEvent(BaseModel):
    event_type: str
    session_id: str
    payment_status: str


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "ADDIT Payment API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# ============= PAYMENT ROUTES =============

@api_router.post("/payments/create-checkout")
async def create_checkout_session(request: PurchaseRequest):
    """Create Stripe checkout session for app purchase"""
    try:
        # Initialize Stripe
        webhook_url = f"{request.origin_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Create success and cancel URLs
        success_url = f"{request.origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{request.origin_url}/payment-cancel"
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=APP_PRICE,
            currency=APP_CURRENCY,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "device_id": request.device_id,
                "product": "ADDIT_APP",
                "price": str(APP_PRICE)
            },
            payment_methods=["card"]  # Supports Apple Pay, Google Pay automatically
        )
        
        session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Store pending transaction in database
        transaction = {
            "session_id": session.session_id,
            "device_id": request.device_id,
            "amount": APP_PRICE,
            "currency": APP_CURRENCY,
            "status": "pending",
            "payment_status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.payment_transactions.insert_one(transaction)
        
        return {
            "checkout_url": session.url,
            "session_id": session.session_id
        }
        
    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    """Check payment status by session ID"""
    try:
        # Initialize Stripe
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        
        # Get checkout status from Stripe
        checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        
        # Update database
        existing = await db.payment_transactions.find_one({"session_id": session_id})
        
        if existing:
            # Only update if status changed and not already completed
            if existing.get("payment_status") != "paid" and checkout_status.payment_status == "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {
                        "$set": {
                            "status": checkout_status.status,
                            "payment_status": checkout_status.payment_status,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                
                # Mark device as purchased
                device_id = existing.get("device_id")
                if device_id:
                    await db.purchases.update_one(
                        {"device_id": device_id},
                        {
                            "$set": {
                                "purchased": True,
                                "purchase_date": datetime.utcnow(),
                                "transaction_id": session_id,
                                "amount": APP_PRICE
                            }
                        },
                        upsert=True
                    )
        
        return {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "amount": checkout_status.amount_total / 100,  # Convert from cents
            "currency": checkout_status.currency
        }
        
    except Exception as e:
        logger.error(f"Error checking payment status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None)):
    """Handle Stripe webhook events"""
    try:
        body = await request.body()
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        
        # Handle webhook
        webhook_response = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        # Process the event
        if webhook_response.payment_status == "paid":
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {
                    "$set": {
                        "payment_status": "paid",
                        "status": "complete",
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Get device_id from metadata
            transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id})
            if transaction:
                device_id = transaction.get("device_id")
                if device_id:
                    await db.purchases.update_one(
                        {"device_id": device_id},
                        {
                            "$set": {
                                "purchased": True,
                                "purchase_date": datetime.utcnow(),
                                "transaction_id": webhook_response.session_id,
                                "amount": APP_PRICE
                            }
                        },
                        upsert=True
                    )
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/purchases/check/{device_id}", response_model=PurchaseStatusResponse)
async def check_purchase_status(device_id: str):
    """Check if a device has purchased the app"""
    try:
        purchase = await db.purchases.find_one({"device_id": device_id})
        
        if purchase and purchase.get("purchased"):
            return PurchaseStatusResponse(
                purchased=True,
                purchase_date=purchase.get("purchase_date").isoformat() if purchase.get("purchase_date") else None,
                transaction_id=purchase.get("transaction_id")
            )
        
        return PurchaseStatusResponse(purchased=False)
        
    except Exception as e:
        logger.error(f"Error checking purchase: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
