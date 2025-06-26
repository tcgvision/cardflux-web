# Deployment Guide for TCG Vision

## Environment Variables Setup

To deploy this application to Vercel, you need to configure the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **DATABASE_URL**
   - Your PostgreSQL database connection string
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://user:pass@localhost:5432/tcgvision`

2. **SIGNING_SECRET**
   - Webhook signing secret from Clerk Dashboard
   - Go to Clerk Dashboard → Webhooks → Endpoint → Signing Secret
   - Copy the signing secret value

3. **CLERK_SECRET_KEY**
   - Secret key from Clerk Dashboard
   - Go to Clerk Dashboard → API Keys → Secret Key
   - Copy the secret key (starts with `sk_`)

4. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**
   - Publishable key from Clerk Dashboard
   - Go to Clerk Dashboard → API Keys → Publishable Key
   - Copy the publishable key (starts with `pk_`)

### Optional Environment Variables

5. **NEXT_PUBLIC_APP_URL** (Optional)
   - Your application's public URL
   - Example: `https://your-app.vercel.app`
   - If not set, will use Vercel's auto-generated URL

### How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value
5. Make sure to set the environment to "Production" (and optionally "Preview" for testing)

### Database Setup

Make sure your database is accessible from Vercel's servers. If using a local database, you'll need to:

1. Use a cloud database service (like Supabase, PlanetScale, or Railway)
2. Or set up a database tunnel for development

### Clerk Configuration

1. In your Clerk Dashboard, add your Vercel domain to the allowed origins
2. Configure the webhook endpoint URL to point to your deployed app
3. Make sure the webhook events are properly configured

### Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up the environment variables as described above
4. Deploy the application

The application should now build and deploy successfully without environment validation errors. 