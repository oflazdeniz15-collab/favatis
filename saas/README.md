# Favatis SaaS Platform

A complete SaaS platform for artists built with Next.js 14 (App Router), Supabase, Stripe, and NextAuth.js.

## 🚀 Features

- **Authentication**: Google, Apple, and Spotify OAuth via NextAuth.js
- **Database**: Supabase PostgreSQL with Row Level Security
- **Payments**: Stripe subscriptions with discount codes
- **Admin Panel**: Approve/reject artist applications
- **AI Integration**: Gemini AI for generating artist bios and content
- **Type-Safe**: Full TypeScript support

## 📁 Project Structure

```
saas/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth configuration
│   │   ├── stripe/checkout/route.ts      # Stripe checkout sessions
│   │   ├── webhooks/stripe/route.ts      # Stripe webhooks
│   │   ├── ai/generate/route.ts          # Gemini AI endpoint
│   │   └── admin/
│   │       ├── pending-artists/route.ts  # Fetch pending artists
│   │       └── approve-artist/route.ts   # Approve/reject artists
│   ├── admin/page.tsx                    # Admin dashboard
│   ├── auth/signin/page.tsx              # Sign in page
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Landing page
│   └── providers.tsx                     # Client providers
├── components/
│   └── AIBioGenerator.tsx                # AI content generation UI
├── lib/
│   └── supabase.ts                       # Supabase clients & types
├── supabase/
│   └── schema.sql                        # Database schema
├── middleware.ts                         # Route protection
├── .env.local.example                    # Environment template
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🛠 Setup Instructions

### 1. Install Dependencies

```bash
cd saas
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required services:
- **Supabase**: Create a project at [supabase.com](https://supabase.com)
- **Stripe**: Get API keys from [stripe.com](https://stripe.com)
- **Google OAuth**: Set up at [Google Cloud Console](https://console.cloud.google.com)
- **Apple OAuth**: Set up at [Apple Developer](https://developer.apple.com)
- **Spotify OAuth**: Set up at [Spotify Developer](https://developer.spotify.com)
- **Gemini AI**: Get API key from [Google AI Studio](https://aistudio.google.com)

### 3. Set Up Database

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy the contents of supabase/schema.sql into Supabase SQL Editor
```

This creates:
- `profiles` table linked to auth.users
- `subscription_tiers` with default tiers
- `discount_codes` table
- `artist_applications` table
- Auto-signup trigger
- Row Level Security policies

### 4. Configure Stripe

1. Create products and prices in Stripe Dashboard:
   - Pro Monthly ($9.99)
   - Pro Yearly ($99.99)
   - Elite Monthly ($29.99)
   - Elite Yearly ($299.99)

2. Add price IDs to `.env.local`

3. Set up webhook endpoint:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

### Stripe
- `POST /api/stripe/checkout` - Create checkout session
- `GET /api/stripe/checkout` - Get subscription status
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Admin
- `GET /api/admin/pending-artists` - Fetch pending artists
- `POST /api/admin/approve-artist` - Approve/reject artist

### AI
- `GET /api/ai/generate` - Get available generation types
- `POST /api/ai/generate` - Generate content with Gemini

## 🔐 Database Schema

### Profiles Table
```sql
- id: UUID (linked to auth.users)
- email: TEXT
- full_name: TEXT
- avatar_url: TEXT
- role: 'admin' | 'artist' | 'user'
- subscription_tier: 'free' | 'pro' | 'elite'
- is_approved: BOOLEAN
- online_time: INTEGER
- stripe_customer_id: TEXT
- stripe_subscription_id: TEXT
```

### Backend Trigger
When a user signs up, a profile row is automatically created via Supabase trigger:

```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🎨 UI Components

- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Custom components**: buttons, cards, inputs
- **Inter + Outfit** fonts

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

- Set `NEXTAUTH_URL` to your production URL
- Update OAuth callback URLs in provider dashboards
- Update Stripe webhook endpoint

## 🧪 Testing Stripe

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## 📝 License

MIT License - feel free to use for your own projects.
