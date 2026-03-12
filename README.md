# Pokémon Card Tracker

A web application for managing and tracking your personal Pokémon trading card collection. Organize cards into custom lists, record details and prices, upload card images, and mark which cards you've collected — all tied to your personal account.

## Features

- **Passwordless authentication** — sign in via magic link sent to your email, no password required
- **Multiple collection lists** — organize cards into named lists (e.g. Base Set, Expansions, Wishlist)
- **Card details** — store card name, set, price in EUR, and an optional link to Cardmarket
- **Image upload** — attach a photo of each card from your device
- **Collected tracking** — check off cards as you acquire them
- **Full CRUD** — add, edit, and delete cards and lists at any time

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Backend & Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (OTP / magic link) |
| File Storage | Supabase Storage |
| Deployment | Vercel |

## How It Works

The app is built on **Next.js** with a pages-router architecture. All backend logic is handled by **Supabase** — there is no custom server. The database holds two core tables: `lists` (named collections per user) and `cards` (individual card records linked to a list). Card images are stored in a Supabase Storage bucket, with each file scoped to the uploading user.

Row Level Security is enforced at the database level, ensuring users can only access their own data. Sessions are managed by Supabase Auth and persist across browser tabs.

The UI uses a three-mode system — **view**, **edit**, and **delete** — toggled from the header, keeping the default browsing experience clean while making management actions explicit and intentional.

## Live App

[pokemon-collector-six.vercel.app](https://pokemon-collector-six.vercel.app/)
