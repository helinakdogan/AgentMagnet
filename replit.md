# Agent Magnet - AI Marketplace Platform

## Overview

Agent Magnet is a modern AI marketplace platform where users can discover and utilize AI agents while developers can list their own agents for sale. The application is built as a full-stack solution with a React frontend and Express backend, featuring a clean, glassmorphism-inspired design with magnetic visual effects.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state management
- **Design System**: Custom design system with glassmorphism effects, gradient themes, and magnetic interaction elements

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Module System**: ES modules with modern Node.js features
- **Development**: Hot reloading with tsx for development builds
- **Production**: esbuild for optimized production builds
- **API Design**: RESTful API structure with JSON responses

### UI Design Philosophy
- **Visual Style**: Glassmorphism with backdrop blur effects
- **Color Scheme**: White/light gray base with purple gradient accents (`#cb88f8` to `#5b43f1` to `#0f0c29`)
- **Typography**: Montserrat font family throughout
- **Interactive Elements**: Magnetic effects on hover with floating dot animations
- **Component Style**: Rounded corners, subtle shadows, and transparent overlays

## Key Components

### Data Models
- **Agents**: Core entity representing AI agents with properties like name, description, category, price, features, and integrations
- **Users**: User management system with username/password authentication structure
- **Categories**: Agent categorization system (Writing, Visual, Audio, Analysis, Chat, Code, Language, Marketing)

### Frontend Components
- **MainLayout**: Wraps all pages with header, footer, and magnetic dot effects
- **AgentCard**: Displays agent information in a grid layout with category icons and status badges
- **MagneticDots**: Interactive floating elements that respond to mouse movement
- **Header/Footer**: Navigation and brand components with interactive magnet logo

### API Endpoints
- `GET /api/agents` - Retrieve all agents or filter by category
- `GET /api/agents/:id` - Retrieve specific agent details

### Storage Layer
- **Current Implementation**: In-memory storage with sample data
- **Database Ready**: Drizzle ORM configured for PostgreSQL with schema definitions
- **Migration Support**: Database migration system set up with drizzle-kit

## Data Flow

1. **Page Load**: User navigates to homepage or agent detail page
2. **Data Fetching**: React Query fetches agent data from Express API
3. **State Management**: Query results cached and managed by TanStack Query
4. **UI Rendering**: Components render with fetched data and apply design system styles
5. **User Interaction**: Magnetic effects and hover states provide interactive feedback
6. **Navigation**: Wouter handles client-side routing without page refreshes

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query for state management
- **UI Framework**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with PostCSS for processing
- **Form Handling**: React Hook Form with Zod for validation
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Carousel**: Embla Carousel for image/content carousels

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL (Neon Database serverless)
- **Validation**: Zod for schema validation
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution, esbuild for bundling

### Development Tools
- **Build System**: Vite with React plugin and runtime error overlay
- **TypeScript**: Full type safety across frontend and backend
- **Linting/Formatting**: TypeScript compiler for type checking
- **Replit Integration**: Cartographer plugin for development environment

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Automatic refresh on file changes
- **Error Handling**: Runtime error overlay for debugging
- **Environment Variables**: DATABASE_URL required for database connection

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Serving**: Express serves built frontend assets in production
- **Database**: PostgreSQL via DATABASE_URL environment variable

### Database Management
- **Schema Management**: Drizzle schema definitions in `shared/schema.ts`
- **Migrations**: Generated migrations stored in `./migrations` directory
- **Database Push**: `npm run db:push` for schema synchronization

### Key Architectural Decisions

1. **Shared Types**: TypeScript types shared between frontend and backend via `shared/` directory
2. **Glassmorphism UI**: Custom design system with backdrop blur and transparency effects
3. **Memory Storage**: Current in-memory storage allows for easy development, with PostgreSQL ready for production
4. **Component Library**: shadcn/ui provides consistent, accessible components while maintaining design flexibility
5. **Magnetic Interactions**: Custom JavaScript for mouse-responsive floating elements enhances user experience
6. **Monorepo Structure**: Frontend, backend, and shared code in single repository for easier development