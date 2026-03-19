# ADDIT Payment Integration Documentation

## 💳 Payment System Overview

ADDIT now includes a complete payment system with **Stripe + Apple Pay + Google Pay** integration for a **one-time purchase of $3.99**.

---

## 🎯 Payment Flow

### User Journey:
1. **User creates PIN** → Navigates to **Paywall**
2. **User clicks "Purchase with Card"** → Redirects to **Stripe Checkout**
3. **User completes payment** → Redirected back to **Payment Success** screen
4. **Payment verified** → Full app access granted → Navigate to **Home Screen**

### On Subsequent Logins:
1. **User enters PIN** → System checks purchase status
2. **If purchased** → Direct to Home Screen
3. **If not purchased** → Show Paywall

---

## 🛠️ Technical Implementation

### Backend APIs (FastAPI)

#### 1. Create Checkout Session
```
POST /api/payments/create-checkout
```

**Request Body:**
```json
{
  "device_id": "device_xxx",
  "origin_url": "https://your-app.com"
}
```

**Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/xxx",
  "session_id": "cs_test_xxx"
}
```

#### 2. Check Payment Status
```
GET /api/payments/status/{session_id}
```

**Response:**
```json
{
  "status": "complete",
  "payment_status": "paid",
  "amount": 3.99,
  "currency": "usd"
}
```

#### 3. Check Purchase Status
```
GET /api/purchases/check/{device_id}
```

**Response:**
```json
{
  "purchased": true,
  "purchase_date": "2026-03-19T22:38:46.123Z",
  "transaction_id": "cs_test_xxx"
}
```

#### 4. Stripe Webhook
```
POST /api/webhook/stripe
```
Handles Stripe webhooks for payment confirmation.

---

### Frontend Screens

#### 1. **Paywall Screen** (`/app/paywall.tsx`)
- Shows app features
- Displays $3.99 price
- "Purchase with Card" button
- Supports Stripe Checkout (Card, Apple Pay, Google Pay)
- Polls payment status after purchase

#### 2. **Payment Success** (`/app/payment-success.tsx`)
- Verifies payment with backend
- Polls every 2 seconds (max 10 attempts)
- Shows success message
- Redirects to Home Screen

#### 3. **Payment Cancel** (`/app/payment-cancel.tsx`)
- Shown when user cancels payment
- "Try Again" button to return to Paywall

---

## 💾 Data Storage

### MongoDB Collections

#### `payment_transactions`
Stores all payment transactions:
```json
{
  "session_id": "cs_test_xxx",
  "device_id": "device_xxx",
  "amount": 3.99,
  "currency": "usd",
  "status": "complete",
  "payment_status": "paid",
  "created_at": "2026-03-19T22:38:46.123Z",
  "updated_at": "2026-03-19T22:39:12.456Z"
}
```

#### `purchases`
Tracks device purchases:
```json
{
  "device_id": "device_xxx",
  "purchased": true,
  "purchase_date": "2026-03-19T22:39:12.456Z",
  "transaction_id": "cs_test_xxx",
  "amount": 3.99
}
```

### Local Storage (AsyncStorage)
- `addit_device_id` - Unique device identifier
- `addit_purchased` - Purchase status ("true" if purchased)
- `addit_pin` - User's 6-digit PIN

---

## 🔐 Security Features

1. **Backend Price Validation**: Price is defined server-side (`APP_PRICE = 3.99`)
2. **Device Tracking**: Each device gets unique ID
3. **Payment Verification**: Polls Stripe API for payment confirmation
4. **Webhook Validation**: Stripe signature verification
5. **No Restore Purchases**: Each device pays separately (as per requirements)

---

## 🧪 Testing

### Test Mode (Current Setup)
- **Stripe API Key**: `sk_test_emergent` (test mode)
- **Test Cards**: Use Stripe test cards
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
- **No real charges**: All transactions are in test mode

### Test Payment Flow:
1. Clear browser storage
2. Create PIN (123456)
3. Click "Purchase with Card"
4. Use test card: `4242 4242 4242 4242`
5. Any future expiry date, any CVC
6. Complete payment
7. Verify redirect to success screen
8. Confirm app access granted

---

## 🚀 Production Setup

### 1. Get Production Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Switch to **Live mode** (toggle in top-left)
3. Get your **Publishable Key** and **Secret Key**
4. Copy **Secret Key** to `/app/backend/.env`:
   ```
   STRIPE_API_KEY=sk_live_YOUR_ACTUAL_KEY
   ```

### 2. Enable Apple Pay & Google Pay
Apple Pay and Google Pay are **automatically available** with Stripe when you:
1. Use `payment_methods: ["card"]` (already implemented)
2. Complete Stripe account verification
3. No additional code needed!

### 3. Configure Webhook
1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Add endpoint: `https://your-app-domain.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy webhook signing secret
5. Update backend if needed (currently auto-handled)

### 4. Update App Price (if needed)
In `/app/backend/server.py`:
```python
APP_PRICE = 3.99  # Change to your desired price
APP_CURRENCY = "usd"  # Change currency if needed
```

---

## 📊 Payment Analytics

### Track in MongoDB:
- Total transactions: `db.payment_transactions.count()`
- Successful payments: `db.purchases.count({ purchased: true })`
- Revenue: Sum of `amount` in `purchases` collection
- Failed payments: Check `payment_transactions` with `payment_status != "paid"`

### Query Examples:
```javascript
// Total revenue
db.purchases.aggregate([
  { $match: { purchased: true } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
])

// Payments by date
db.purchases.aggregate([
  { $match: { purchased: true } },
  { $group: {
    _id: { $dateToString: { format: "%Y-%m-%d", date: "$purchase_date" } },
    count: { $sum: 1 },
    revenue: { $sum: "$amount" }
  }}
])
```

---

## ❓ Troubleshooting

### Issue: Payment not verifying
**Solution**: 
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Verify Stripe API key is correct
- Check network connectivity

### Issue: User sees paywall after payment
**Solution**:
- Check `AsyncStorage` for `addit_purchased` key
- Verify device_id matches in database
- Check `purchases` collection in MongoDB

### Issue: Webhook not received
**Solution**:
- Verify webhook URL is publicly accessible
- Check Stripe Dashboard → Webhooks → Recent deliveries
- Ensure webhook signature validation is working

---

## 🔄 Payment State Machine

```
[New User] 
    ↓
[Create PIN] 
    ↓
[Paywall] 
    ↓
[Click Purchase] 
    ↓
[Create Checkout Session] 
    ↓
[Stripe Checkout Page]
    ↓
[Complete Payment]
    ↓
[Payment Success Screen]
    ↓
[Poll Payment Status]
    ↓
[Verify with Backend]
    ↓
[Update Database]
    ↓
[Grant Access]
    ↓
[Home Screen]
```

---

## 💡 Future Enhancements

### Potential Features:
1. **Receipt Validation**: Verify Apple/Google in-app purchases
2. **Family Sharing**: Allow purchase sharing across devices
3. **Promotional Codes**: Discount system
4. **Refund Handling**: Automated refund processing
5. **Analytics Dashboard**: Revenue tracking UI
6. **Email Receipts**: Send purchase confirmation emails
7. **Trial Period**: 7-day free trial before paywall

---

## 📝 API Keys Summary

### Current (Test Mode):
- **Stripe**: `sk_test_emergent` (demo key, no real charges)
- **PayPal**: Not implemented yet (Stripe handles all payments)

### For Production:
1. Replace `STRIPE_API_KEY` in `/app/backend/.env`
2. Test with real card in production
3. Monitor Stripe Dashboard for transactions

---

## 🎨 Paywall UI Customization

### Change Price Display:
Edit `/app/frontend/app/paywall.tsx`:
```typescript
const APP_PRICE = '$3.99';  // Change display price
```

### Change Features List:
Update the features in the `featuresContainer`:
```jsx
<View style={styles.feature}>
  <Ionicons name="checkmark-circle" size={24} color="#00c896" />
  <Text style={styles.featureText}>Your custom feature</Text>
</View>
```

### Change Colors:
```typescript
// Primary color (purchase button)
backgroundColor: '#00c896'

// Text colors
color: '#fff'
color: 'rgba(255,255,255,0.6)'
```

---

## ✅ Checklist for Go-Live

- [ ] Replace test Stripe key with production key
- [ ] Test with real credit card
- [ ] Configure webhook in Stripe Dashboard
- [ ] Test Apple Pay on iOS device
- [ ] Test Google Pay on Android device
- [ ] Verify payment confirmation emails (if configured)
- [ ] Test payment failure scenarios
- [ ] Test cancellation flow
- [ ] Monitor first 10 transactions closely
- [ ] Set up revenue alerts in Stripe

---

## 📞 Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Payment Methods**: https://stripe.com/docs/payments/payment-methods

---

**Integration Complete! 🎉**

The ADDIT app now has a fully functional payment system with Stripe, supporting Credit Cards, Apple Pay, and Google Pay for a one-time purchase of $3.99.

*Last Updated: March 19, 2026*
