# Enosi Wedding Marketplace - Environment Setup

## 🔧 Environment Variables Configuration

This application requires several environment variables to be configured for full functionality.

### Backend Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in the actual values:

```bash
cp backend/.env.example backend/.env
```

#### Required Variables:

1. **Database Configuration:**
   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=enosi_db
   ```

2. **Email Configuration (SendGrid):**
   ```
   SENDGRID_API_KEY=your_actual_sendgrid_api_key
   SENDER_EMAIL=support@enosiweddings.com
   ADMIN_EMAIL=james@enosiweddings.com
   ```
   
   **To get SendGrid API Key:**
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Go to Settings → API Keys
   - Create new API key with "Mail Send" permissions
   - Verify your sender email address in SendGrid

3. **JWT Secret (for authentication):**
   ```
   JWT_SECRET_KEY=your_super_secure_random_string_here
   ```

4. **Stripe Configuration:**
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

5. **Supabase Configuration (for file uploads):**
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_BUCKET=wedding-assets
   ```

### Frontend Environment Variables (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env` and configure:

```bash
cp frontend/.env.example frontend/.env
```

```
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 🔒 Security Notes

- **Never commit `.env` files** to version control
- **Keep API keys secure** and don't share them
- **Use test keys** for development
- **Use production keys** only in production environment

### 🚀 Getting Started

1. Copy the example files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. Fill in your actual API keys and credentials

3. Start the application:
   ```bash
   sudo supervisorctl restart all
   ```

### 📧 Email Setup Guide

1. **Create SendGrid Account**
2. **Verify Sender Email** (support@enosiweddings.com)
3. **Create API Key** with Mail Send permissions
4. **Add API Key** to `backend/.env`
5. **Test Email** functionality

### 💳 Stripe Setup Guide

1. **Create Stripe Account**
2. **Get Test API Keys** from Stripe Dashboard
3. **Add Keys** to both backend and frontend `.env` files
4. **Test Payment** functionality

### 🗄️ Database Setup

The application uses MongoDB. Make sure MongoDB is running locally or update the `MONGO_URL` to point to your MongoDB instance.

### ⚠️ Important Notes

- The `backend/.env` file contains sensitive information and should never be committed to Git
- Make sure to restart the backend after changing environment variables
- All email notifications require proper SendGrid configuration
- Stripe integration requires both secret and publishable keys