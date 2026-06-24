# 🚀 UPI Payment - Quick Start (5 Minutes)

## ⚡ Super Fast Setup

### Step 1: Get Cashfree Account (2 min)

1. Sign up: https://merchant.cashfree.com/merchants/signup
2. Go to: Dashboard → Developers → API Keys
3. Copy **Test App ID** and **Test Secret Key**

---

### Step 2: Add Credentials (1 min)

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_CASHFREE_APP_ID=paste_your_test_app_id_here
CASHFREE_SECRET_KEY=paste_your_test_secret_key_here
NEXT_PUBLIC_CASHFREE_ENV=TEST
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 3: Start & Test (2 min)

```bash
# Start server
npm run dev

# Open browser
http://localhost:3000

# Test flow:
1. Add product to cart
2. Click cart icon
3. Click "PROCEED TO CHECKOUT"
4. Fill details:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
5. Click "Pay via UPI"
6. Use test UPI: success@upi
7. See success page! 🎉
```

---

## 🎯 Test UPI IDs

| UPI ID | Result |
|--------|--------|
| `success@upi` | ✅ Success |
| `failure@upi` | ❌ Failed |

---

## 💰 Transaction Fee

**UPI: Only 0.5%** (Lowest in India!)

Example:
- Sale: ₹1,000
- Fee: ₹5
- You get: ₹995

---

## 🎊 That's It!

You're ready to accept UPI payments!

**For production:**
1. Complete KYC on Cashfree
2. Get production keys
3. Update `.env.local` with production keys
4. Change `NEXT_PUBLIC_CASHFREE_ENV=PROD`
5. Deploy! 🚀

---

**Need help?** Check `PAYMENT_SETUP_GUIDE.md` for detailed instructions.
