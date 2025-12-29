# Church Anniversary Management App

A small React app to manage event attendees, check-ins, and giveaway shirts using Supabase as the backend.

## Overview

- Two main views: **Registration** (check-in and filters) and **Shirt Management** (sizes, payment, distribution).
- Built with **React (Create React App)** and **Tailwind CSS**.
- Uses **Supabase** for storing `people`, `registrations`, and `shirts` data.

## Features ✅

- Search and filter attendees by name, age bracket, location, and check-in status.
- Bulk check-in and bulk remove check-ins.
- Print-friendly registration view (uses print-specific CSS rules).
- Shirt management: set shirt size, toggle **Paid/Unpaid** and **Given/Pending**.
- Dashboard stats for quick overview (registered, paid, shirts given, pending).

## Tech stack 🔧

- React (Create React App)
- Tailwind CSS
- Supabase (database + auth)
- Lucide icons

## Quick start — local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

   Open http://localhost:3000 to view the app.

3. Run tests:

   ```bash
   npm test
   ```

4. Build for production:

   ```bash
   npm run build
   ```

## Environment & Supabase

The project currently initializes Supabase in `src/services/supabase.js`.
For local development you can provide your own keys — recommended approach is to store secrets in a `.env` file and read them from the code.

Required values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Note: The repo contains example values in `src/services/supabase.js`; consider moving these into a proper environment configuration before deploying.

## Project structure 📁

- `src/App.js` — application state, view switching, and bulk actions
- `src/components/RegistrationView.js` — registration UI and print layout
- `src/components/ShirtManagementView.js` — shirt UI and controls
- `src/services/api.js` — Supabase queries and data transformation
- `src/services/supabase.js` — Supabase client configuration

## Contributing

PRs welcome — open an issue or PR with a concise description and tests or screenshots when appropriate.

## License

MIT
