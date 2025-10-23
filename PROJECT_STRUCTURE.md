# Project Structure

This project has been reorganized into a clean frontend/backend separation while maintaining all functionality.

## 📁 Directory Structure

```
P/
├── app/                        # Next.js App Router (symlinked from frontend/)
│   ├── (auth)/                # Auth pages
│   ├── (dashboard)/           # Dashboard pages
│   ├── auth/                  # API routes for authentication
│   ├── users/                 # User management API routes
│   ├── chat/                  # Chat API routes
│   ├── approvals/             # Approvals API routes
│   ├── websocket/             # WebSocket API routes
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page component
├── components/                # React components (symlinked from frontend/)
│   ├── approval/              # Approval components
│   ├── chat/                  # Chat components
│   ├── dashboard/             # Dashboard components
│   ├── layout/                # Layout components
│   └── ui/                    # UI components
├── hooks/                     # Custom React hooks (symlinked from frontend/)
│   └── use-auth.ts            # Authentication hook
├── stores/                    # State management (symlinked from frontend/)
│   └── auth-store.ts          # Authentication store
├── types/                     # TypeScript type definitions (symlinked from frontend/)
│   ├── api.ts                 # API types
│   ├── database.ts            # Database types
│   └── index.ts               # Main types
├── frontend/                  # Frontend source files (organized)
│   ├── app/                   # Next.js App Router source
│   ├── components/            # React components source
│   ├── hooks/                 # Custom React hooks source
│   ├── stores/                # State management source
│   └── types/                 # TypeScript type definitions source
├── backend/                   # Backend logic
│   ├── lib/                   # Backend libraries
│   │   ├── auth/              # Authentication logic
│   │   │   ├── auth-config.ts # Auth configuration
│   │   │   ├── middleware.ts  # Auth middleware
│   │   │   ├── session-manager.ts # Session management
│   │   │   └── types.ts       # Auth types
│   │   ├── database/          # Database operations
│   │   │   ├── connection.ts  # DB connection
│   │   │   └── users.ts       # User operations
│   │   ├── kv/                # Key-value storage
│   │   │   └── connection.ts  # KV connection
│   │   ├── utils/             # Utility functions
│   │   │   ├── errors.ts      # Error handling
│   │   │   └── logger.ts      # Logging
│   │   ├── analytics/         # Analytics
│   │   ├── approval/          # Approval logic
│   │   ├── security/          # Security utilities
│   │   └── websocket/         # WebSocket logic
│   └── scripts/               # Database and utility scripts
│       ├── migrate-db.js      # Database migration
│       ├── migrate-functions.js # Function migration
│       └── test-connections.js # Connection testing
├── shared/                    # Shared configuration files
│   ├── package.json           # Dependencies
│   ├── package-lock.json      # Lock file
│   ├── next.config.js         # Next.js config
│   ├── tailwind.config.ts     # Tailwind config
│   ├── postcss.config.mjs     # PostCSS config
│   ├── tsconfig.json          # TypeScript config
│   └── next-env.d.ts          # Next.js types
├── .env.local                 # Environment variables
├── next.config.js             # Root Next.js config (with aliases)
├── tsconfig.json              # Root TypeScript config (with paths)
├── tailwind.config.ts         # Root Tailwind config
├── postcss.config.mjs         # Root PostCSS config
├── package.json               # Root package.json
├── package-lock.json          # Root lock file
└── README.md                  # Project documentation
```

## 🔧 Configuration Updates

### Path Aliases
The following path aliases have been configured:

- `@/*` → `./frontend/*`
- `@/frontend/*` → `./frontend/*`
- `@/backend/*` → `./backend/*`
- `@/shared/*` → `./shared/*`
- `@/lib/*` → `./backend/lib/*`
- `@/components/*` → `./frontend/components/*`
- `@/hooks/*` → `./frontend/hooks/*`
- `@/stores/*` → `./frontend/stores/*`
- `@/types/*` → `./frontend/types/*`

### Import Examples
```typescript
// Frontend imports
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import Button from "@/components/ui/button";

// Backend imports (in API routes)
import { createSession } from "@/lib/auth/session-manager";
import { createOrUpdateUser } from "@/lib/database/users";
import { logger } from "@/lib/utils/logger";
```

## ✅ Verification

The project structure has been verified and tested:

1. ✅ All files moved to appropriate directories
2. ✅ Import paths updated with proper aliases
3. ✅ Configuration files updated
4. ✅ Development server starts successfully
5. ✅ No compilation errors
6. ✅ All functionality preserved

## 🚀 Running the Project

```bash
# From the project root directory
npm run dev
```

The server will run on `http://localhost:3000` (or the next available port).

### Available Scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations

## 📝 Notes

- API routes remain in the frontend/app directory as required by Next.js App Router
- Backend logic is properly separated in the backend/lib directory
- All imports use the configured path aliases for maintainability
- Configuration files are duplicated in both root and shared directories for convenience
- The project maintains full functionality while having a cleaner, more organized structure
