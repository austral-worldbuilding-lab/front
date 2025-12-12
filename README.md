# Austral Worldbuilding Lab - Frontend

The frontend application for the Austral Worldbuilding Lab platform, built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), and TypeScript. It uses Tailwind CSS for styling and Firebase for authentication.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4 + Radix UI
- **State Management:** TanStack React Query + Context API
- **Authentication:** Firebase Auth
- **Canvas:** Konva (for Mandala visualization)
- **HTTP Client:** Axios

## Prerequisites

- Node.js 18+
- npm 9+
- Firebase project credentials
- Backend API running (see backend repository)

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:austral-worldbuilding-lab/front.git
cd front
```

### 2. Configure Git Hooks

To ensure code quality before commits, set up the git hooks:

```bash
bash git-hooks/init.sh
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file based on the template:

```bash
cp .env.template .env
```

Then edit `.env` with your credentials:

| Variable                            | Description                                               |
| ----------------------------------- | --------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API key                                          |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain (e.g., `project.firebaseapp.com`)    |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                                       |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket                                   |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                              |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID                                           |
| `VITE_FIREBASE_MEASUREMENT_ID`      | Firebase analytics measurement ID (optional)              |
| `VITE_FIREBASE_DATABASE_URL`        | Firebase Realtime Database URL                            |
| `VITE_API_URL`                      | Backend API base URL (e.g., `http://localhost:3000`)      |
| `VITE_PUBLIC_POSTHOG_KEY`           | PostHog analytics key (optional)                          |
| `VITE_PUBLIC_POSTHOG_HOST`          | PostHog host URL (optional)                               |
| `VITE_PUBLIC_ENVIRONMENT`           | Environment name (`development`, `staging`, `production`) |

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Type-check and build for production      |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint to check code quality         |

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts)
├── components/      # React components
│   ├── ui/          # Base UI components (Button, Dialog, etc.)
│   ├── mandala/     # Mandala-specific components
│   ├── layout/      # Layout components (Header, AppLayout)
│   └── ...          # Feature-specific components
├── config/          # Configuration (Firebase)
├── constants/       # Application constants
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
├── pages/           # Page components
├── services/        # API service layer
├── styles/          # Global styles
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Build for Production

```bash
npm run build
```

This generates an optimized build in the `dist/` directory.

## Contributing

1. Create a branch following the naming pattern: `[CARD_ID]/description`
2. Make your changes
3. Ensure `npm run lint` passes
4. Test your changes manually
5. Create a Pull Request using the template

## Documentation

For detailed technical documentation including architecture, patterns, and development guidelines, see [TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md).
