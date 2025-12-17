# CodeSync Frontend

This is the frontend module of CodeSync, a real-time technical interview platform. This documentation covers the frontend-specific setup, configuration, and development guidelines.

## Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:**
  - Tailwind CSS
  - DaisyUI (Component Library)
- **State Management:** React Hooks + Context API
- **Real-Time Communication:**
  - Stream Video & Chat SDK
  - Socket.io Client
- **Code Editor:** Monaco Editor
- **Icons:** Lucide React
- **Form Handling:** React Hook Form
- **HTTP Client:** Axios
- **Routing:** React Router DOM

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STREAM_API_KEY=your_stream_api_key
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend server running (see root README for setup)

### Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── api/              # API client setup and service functions
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable UI components
│   ├── editor/       # Code editor components
│   ├── video/        # Video call components
│   ├── chat/         # Chat components
│   └── ui/           # Base UI components (buttons, inputs, etc.)
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── Dashboard/    # Main dashboard
│   ├── Session/      # Interview session page
│   └── Auth/         # Authentication pages
├── styles/           # Global styles and Tailwind config
└── utils/            # Utility functions
```

## Development Guidelines

- Follow the [React Hooks](https://reactjs.org/docs/hooks-intro.html) pattern
- Use functional components with TypeScript
- Follow the [Tailwind CSS](https://tailwindcss.com/docs) utility-first approach
- Keep components small and focused on a single responsibility
- Use meaningful component and variable names
- Write unit tests for complex logic (using Vitest + React Testing Library)

## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes following the code style
3. Write tests if applicable
4. Submit a pull request with a clear description of changes
