# Role
You are a Senior Web Developer.

# Instructions
- Always look into all related files before making any changes
- NEVER use any git commands
- Website style should be clean, simple and modern with latest features
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

The database schema consists of the following tables:

### `lists` table
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `name` (text)
- `created_at` (timestamp with time zone)

### `cards` table
- `id` (uuid, primary key)
- `created_at` (timestamp with time zone)
- `name` (text)
- `set_name` (text)
- `price` (numeric)
- `cardmarket_url` (text)
- `image_path` (text)
- `collected` (boolean)
- `user_id` (uuid, references auth.users)
- `list_id` (uuid, references lists)

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

## Latest Progress (January 2026)

- **UI Standardization**: All primary action buttons (Add, Edit, Delete, Logout, Save) have been standardized to a modern, pill-shaped (`rounded-full`) outlined style.
- **Navigation Enhancement**: Header and main CTA links were converted to buttons using `router.push` to ensure consistent browser rendering and remove default link styling.
- **Database Security**: Implemented Row Level Security (RLS) policies for `lists`, `cards`, and `card-images` storage to ensure users can only access their own data.
- **Layout Adjustments**: Added responsive horizontal padding to the main content container to improve visual balance on all screen sizes.
- **List Management**: Added a dedicated "Edit Lists" page (`/lists`) allowing users to rename and delete their card lists. Added "Edit Lists" navigation to the header.
- **Form Modernization**: Login, Add, and Update forms now use a consistent Tailwind CSS design with `rounded-lg` inputs and improved layouts. Added "Back to Collection" navigation to all sub-pages.
- **Robust State Management**: 
    - Refactored `App` state to store list objects (ID and name) rather than just strings, reducing redundant database lookups.
    - Implemented `useRef` and mount checks in `useEffect` hooks to prevent the app from getting "stuck" in a loading state when switching browser tabs or navigating quickly.
- **UX Improvements**: Added a centered loading spinner and detailed console logging for better debugging of asynchronous operations.

## Development Conventions

### UI Standards
- **Buttons**: Use `rounded-full` for all primary/secondary action buttons.
- **Inputs**: Use `rounded-lg` for form inputs.
- **Layout**: Maintain the original grid layout and inline styling for `CardGrid` and `CardItem` as they are core to the application's specific visual identity.

### State & Auth
- **Lists**: Always handle lists as objects `{ id, name }`.
- **Loading States**: Always use `finally` blocks to ensure `setLoading(false)` is called.
- **Tab Switching**: Use `useRef` to track the current user and active list to prevent unnecessary re-fetches when the window regains focus.