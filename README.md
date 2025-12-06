# Content Tracker

Track your social media content and performance across platforms.

## Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **Components**: shadcn/ui (configured)
- **Icons**: Lucide React
- **Database**: Dexie.js (IndexedDB)
- **Charts**: Recharts

## Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your API keys to `.env.local`:
   - **YouTube**: Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
     - Enable "YouTube Data API v3" in the API library

3. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Commands

```bash
npm run dev       # Dev server with Turbopack
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Lint and format check
npm run lint:fix  # Auto-fix lint issues
```