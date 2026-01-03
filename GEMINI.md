# Role
You are a Senior Web Developer.

# Instructions
- NEVER do git commits and pushes
- Website style should be clean, simple and modern with latest feautures
- When I ask to "fix" something, show a diff before applying changes.

# Project Overview

This is a Pokémon card tracker application built with Next.js, React, and TypeScript. It allows users to manage their Pokémon card collection. The application uses Supabase for the backend, including database storage for card information and file storage for card images. Tailwind CSS is used for styling.

The application provides the following features:
- User authentication (login/logout)
- Viewing a collection of Pokémon cards
- Adding new cards to the collection, including image uploads
- Updating existing cards
- Deleting cards from the collection

## Building and Running

### Prerequisites

- Node.js and npm (or yarn, pnpm, bun) installed.
- A Supabase project set up with a `cards` table and a `card-images` storage bucket.

### Installation

1. Clone the repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the application

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start the development server on `http://localhost:3000`.

### Building for production

To build the application for production, use the following command:

```bash
npm run build
```

This will create an optimized production build in the `.next` directory.

### Starting the production server

To start the production server, use the following command:

```bash
npm run start
```

## Development Conventions

### Code Style

The project uses ESLint for code linting. To run the linter, use the following command:

```bash
npm run lint
```

The project follows the standard Next.js project structure.

### Backend

The application uses Supabase for its backend. The Supabase client is initialized in `lib/supabaseClient.ts`.
All interactions with the database and storage are done through the Supabase client.

The database schema consists of a `cards` table with the following columns:
- `id` (uuid, primary key)
- `created_at` (timestamp with time zone)
- `name` (text)
- `set_name` (text)
- `price` (numeric)
- `cardmarket_url` (text)
- `image_path` (text)
- `collected` (boolean)

Card images are stored in a Supabase storage bucket named `card-images`.

### Components

The application is built using React components, which are located in the `components` directory. The main components are:
- `CardGrid`: Displays the collection of cards in a grid.
- `CardItem`: Renders a single card with its details.
- `AddCardForm`: A form for adding a new card.
- `UpdateCardForm`: A form for updating an existing card.

### Pages

The application's pages are located in the `pages` directory. The main pages are:
- `index.tsx`: The home page, which displays the user's card collection.
- `add.tsx`: The page for adding a new card.
- `update/[id].tsx`: The page for updating a specific card.
- `login.tsx`: The login page.

### Deployment

Project is deployed with vercel on the website with URL: https://pokemon-collector-six.vercel.app/