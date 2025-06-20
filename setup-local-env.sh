#!/bin/bash

# Local Development Environment Setup Script
# This script sets up environment variables for local development
# DO NOT COMMIT THIS FILE TO GIT

echo "Setting up local development environment..."

# Create backend .env with actual values for local development
cat > backend/.env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=enosi_db
SENDGRID_API_KEY=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
SENDER_EMAIL=james@enosiweddings.com
ADMIN_EMAIL=james@enosiweddings.com
JWT_SECRET_KEY=enosi-wedding-marketplace-very-secure-key-for-jwt-tokens
EOF

echo "✅ Backend environment variables configured"

# Restart services
echo "🔄 Restarting services..."
sudo supervisorctl restart backend

echo "✅ Local development environment setup complete!"
echo "⚠️  Remember: This setup is for local development only"
echo "📝 For production, use proper environment variable management"