# 🎴 TCG Vision Web

> AI-powered card recognition & inventory management for Trading Card Game shops and collectors.

This is the **Next.js web frontend** for [TCG Vision](https://github.com/tcgvision), a vertical SaaS platform designed to help stores and collectors manage, scan, and track physical trading cards starting with **One Piece TCG**, with planned expansion to **Pokémon, Yu-Gi-Oh!**, and beyond.

## ⚙️ Tech Stack

This project is built using the [T3 Stack](https://create.t3.gg/), a collection of type-safe, modern web development tools:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [Clerk.dev](https://clerk.dev)
- **Database**: [PostgreSQL via Supabase](https://supabase.com/)
- **ORM**: [Prisma](https://prisma.io/)
- **API Layer**: [tRPC](https://trpc.io/)
- **Payments**: [Stripe](https://stripe.com/)
- **AI Pipeline**: YOLOv8 + CLIP + FAISS (external recognition service)

## 🧱 Project Structure

```
.
├── app/          # App Router routes (Next.js)
├── components/   # UI components using shadcn/ui
├── features/     # Domain logic (scanner, inventory, dashboard)
├── lib/          # Utilities (Supabase client, auth, helpers)
├── server/
│   ├── api/      # tRPC routers
│   ├── auth/     # Clerk integration
│   └── db/       # Prisma client and DB helpers
├── prisma/
│   └── schema.prisma  # DB schema
├── types/        # Global types
├── public/       # Static assets
└── .env.example  # Environment variable template
```

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/tcgvision/tcgvision-web.git
cd tcgvision-web
```

### 2. Install dependencies
Using pnpm:
```bash
pnpm install
```
If you don't have it yet: `npm i -g pnpm`

### 3. Environment Setup
Create your `.env` file:
```bash
cp .env.example .env
```

Add the following variables:
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. Database Setup
Generate and migrate schema:
```bash
pnpm prisma generate
pnpm prisma migrate dev --name init
```

View your DB visually with:
```bash
pnpm prisma studio
```

### 5. Development
Run local dev server:
```bash
pnpm dev
```
The app will be live at http://localhost:3000

## 🧼 Code Quality

We use:
- ESLint with TypeScript rules
- Prettier
- Husky + lint-staged (optional)

To format:
```bash
pnpm format
```

To lint:
```bash
pnpm lint
```

## 📈 Core Features (in-progress)

### For Shops
- Scan cards using webcam or phone + sync
- Inventory system with set/rarity tracking
- Real-time price sync (via TCGPlayer)
- Buy/sell toggles and activity feed
- Dashboard with analytics
- Discord bot for public inventory

### For Collectors
- Personal collection tracking
- Wishlist & price alerts
- "Scan to add" feature
- Real-time collection value tracking

## 💡 Roadmap
- Clerk authentication flow
- tRPC + Prisma integration
- Inventory dashboard
- Stripe subscriptions
- AI scanner pipeline integration (YOLOv8 + CLIP + FAISS)
- Discord bot integration

## 🤝 Contributing
1. Fork this repo
2. Create a new branch: `git checkout -b feature/my-feature`
3. Write clean, typed code that follows conventions
4. Run `pnpm format` before committing
5. Submit a pull request to main

## 📄 License
This project is proprietary and developed by the TCG Vision founding team.

## 🧙 About the Project
TCG Vision is being built by competitive players, shop owners, and engineers who deeply understand the problems of managing physical card games in the modern world. We aim to revolutionize TCG operations — starting with AI.

## 📚 Learn More
To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:
- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

## 🚢 Deployment
Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
