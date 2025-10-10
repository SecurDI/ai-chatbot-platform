# AI Chatbot Platform Development Prompt

## Project Overview
You are an expert full-stack developer specializing in building scalable, secure web applications using Next.js and Vercel ecosystem tools. You are tasked with building a **professional-grade AI-powered chatbot platform** that will eventually manage AWS cloud infrastructure. This initial build focuses on creating the **core platform foundation** with authentication, user management, chat interface, and approval workflows. The codebase must be architected to easily integrate AI models and AWS management capabilities later.

## Critical Development Principles
1. **Professional Codebase**: Use industry best practices, clean code principles, and SOLID design patterns
2. **Minimal Functions**: Create reusable components and utilities to avoid code duplication
3. **Comprehensive Documentation**: Add detailed comments throughout the entire codebase explaining purpose, parameters, and usage
4. **Future-Ready Architecture**: Design with clear separation of concerns to easily add AI and AWS integrations
5. **Type Safety**: Use TypeScript throughout for better maintainability and debugging

## Technical Stack Requirements

### Frontend Stack
```
- Framework: Next.js 14 with App Router
- Styling: Tailwind CSS
- State Management: Zustand
- TypeScript: Strict mode enabled
- UI Components: Build custom components (no external libraries like shadcn)
- Icons: Lucide React (already available)
- Real-time: WebSocket connections for live updates
```

### Backend Stack
```
- Runtime: Next.js API routes (Node.js 20)
- Database: Vercel Postgres with proper schemas
- Cache: Vercel KV for sessions and rate limiting
- Authentication: EntraID (Azure AD) with OIDC
- Session Management: JWT with refresh tokens
```

## Database Schema Implementation

### Required Tables (Vercel Postgres)
```sql
-- Users table
users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entra_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'end-user')),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Approval requests table
approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  command_text TEXT NOT NULL,
  justification TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  approver_id UUID REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Activity logs table
activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID,
  action_type VARCHAR(100) NOT NULL,
  resource_service VARCHAR(50),
  command_executed TEXT,
  command_response TEXT,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'denied')),
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  duration_ms INTEGER
);

-- Chat sessions table (for future AI integration)
chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Chat messages table (for future AI integration)
chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## Core Features to Implement

### 1. Authentication System (EntraID Integration)
**File Structure:**
```
/lib/auth/
  - auth-config.ts (EntraID OIDC configuration)
  - session-manager.ts (JWT token handling with Vercel KV)
  - middleware.ts (Route protection middleware)
  - types.ts (Authentication type definitions)
```

**Requirements:**
- Implement OIDC authentication with EntraID
- 8-hour session timeout with refresh token support
- Store sessions in Vercel KV for performance
- Role-based access control (admin/end-user)
- Automatic user creation/update on login

### 2. User Management System
**File Structure:**
```
/lib/database/
  - connection.ts (Vercel Postgres connection)
  - users.ts (User CRUD operations)
  - queries.ts (Reusable SQL queries)
/app/api/users/ (REST endpoints for user operations)
```

**Requirements:**
- Complete user CRUD operations
- Role management with proper permissions
- User activity tracking
- Admin-only user management endpoints

### 3. Chat Interface Components
**File Structure:**
```
/components/chat/
  - chat-container.tsx (Main chat interface)
  - message-bubble.tsx (Individual message component)
  - message-input.tsx (Input field with send button)
  - chat-sidebar.tsx (Session history and quick actions)
  - typing-indicator.tsx (For future AI responses)
/hooks/
  - use-chat.ts (Chat state management with Zustand)
  - use-websocket.ts (WebSocket connection hook)
```

**Requirements:**
- Clean, responsive chat UI similar to ChatGPT/Claude
- Message history persistence per user session
- Real-time message updates via WebSocket
- Support for rich formatting (code blocks, tables)
- Typing indicators for future AI integration
- Message status indicators (sent, delivered, processing)

### 4. Approval Workflow System
**File Structure:**
```
/components/approval/
  - approval-request-form.tsx (Submit approval requests)
  - approval-dashboard.tsx (Admin approval management)
  - approval-list.tsx (List of pending approvals)
/lib/approval/
  - workflow-manager.ts (Approval logic and state management)
  - notifications.ts (Email and Teams notification system)
/app/api/approvals/ (Approval CRUD endpoints)
```

**Requirements:**
- Request approval form for end-users
- Admin dashboard for managing approvals
- Automatic expiration after 24 hours
- Real-time notifications for status updates
- Email notifications for admins
- Approval history and audit trail

### 5. Dashboard and Analytics
**File Structure:**
```
/components/dashboard/
  - main-dashboard.tsx (User role-specific dashboard)
  - activity-feed.tsx (Recent activities)
  - stats-cards.tsx (Key metrics display)
  - alert-panel.tsx (Real-time alerts)
/lib/analytics/
  - metrics.ts (Analytics data processing)
  - alerts.ts (Alert generation and management)
```

**Requirements:**
- Role-based dashboard views (admin vs end-user)
- Real-time activity feed
- System status indicators
- Alert management panel
- User activity statistics

### 6. Rate Limiting and Security
**File Structure:**
```
/lib/security/
  - rate-limiter.ts (Vercel KV-based rate limiting)
  - input-validator.ts (Request validation)
  - security-headers.ts (Security middleware)
/middleware.ts (Global middleware for auth and rate limiting)
```

**Requirements:**
- User-based rate limiting using Vercel KV
- Input sanitization and validation
- CSRF protection
- Security headers implementation
- Command validation framework (for future AWS integration)

## Project Structure Requirements

```
project-root/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication routes group
│   ├── (dashboard)/              # Protected dashboard routes
│   ├── api/                      # API route handlers
│   └── globals.css               # Global styles
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components
│   ├── chat/                     # Chat-specific components
│   ├── dashboard/                # Dashboard components
│   └── approval/                 # Approval workflow components
├── lib/                          # Utility libraries
│   ├── auth/                     # Authentication utilities
│   ├── database/                 # Database operations
│   ├── security/                 # Security utilities
│   └── utils/                    # General utilities
├── hooks/                        # Custom React hooks
├── stores/                       # Zustand state stores
├── types/                        # TypeScript type definitions
├── middleware.ts                 # Next.js middleware
└── tailwind.config.js           # Tailwind configuration
```

## API Endpoint Structure

### Authentication Endpoints
```
POST /api/auth/login              # Initiate EntraID login
POST /api/auth/callback           # Handle OIDC callback
POST /api/auth/logout             # User logout
POST /api/auth/refresh            # Refresh JWT token
GET  /api/auth/session            # Get current session
```

### User Management Endpoints
```
GET    /api/users                 # List users (admin only)
GET    /api/users/[id]            # Get user details
PUT    /api/users/[id]            # Update user (admin only)
DELETE /api/users/[id]            # Deactivate user (admin only)
GET    /api/users/profile         # Get current user profile
```

### Chat Endpoints (Future AI Integration Ready)
```
GET  /api/chat/sessions           # Get user chat sessions
POST /api/chat/sessions           # Create new chat session
GET  /api/chat/sessions/[id]      # Get session messages
POST /api/chat/sessions/[id]/messages # Send message (future AI integration)
```

### Approval Endpoints
```
GET    /api/approvals             # List approvals (role-filtered)
POST   /api/approvals             # Create approval request
PUT    /api/approvals/[id]        # Approve/reject request (admin only)
DELETE /api/approvals/[id]        # Cancel request (requester only)
```

## Environment Variables Setup

```bash
# Database
DATABASE_URL="your-vercel-postgres-url"
POSTGRES_URL="your-postgres-connection-string"

# Cache
KV_REST_API_URL="your-vercel-kv-url"
KV_REST_API_TOKEN="your-vercel-kv-token"

# Authentication (EntraID/Azure AD)
AZURE_AD_CLIENT_ID="your-azure-app-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-app-client-secret"
AZURE_AD_TENANT_ID="your-azure-tenant-id"
NEXTAUTH_URL="your-app-url"
NEXTAUTH_SECRET="your-nextauth-secret"

# Security
JWT_SECRET="your-jwt-secret-key"
ENCRYPTION_KEY="your-encryption-key"

# Future Integration Placeholders
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AI_MODEL_API_KEY=""
```

## Key Implementation Requirements

### 1. Code Quality Standards
- **TypeScript Strict Mode**: Enable all strict type checking
- **Error Handling**: Implement comprehensive try-catch blocks with proper error logging
- **Code Comments**: Every function must have JSDoc comments explaining purpose, parameters, and return values
- **Consistent Naming**: Use camelCase for variables/functions, PascalCase for components/types
- **No Dead Code**: Remove unused imports, variables, and functions

### 2. Database Best Practices
- **Connection Pooling**: Use proper connection management with Vercel Postgres
- **Query Optimization**: Use prepared statements and proper indexing
- **Transaction Management**: Wrap related operations in database transactions
- **Migration Scripts**: Create proper database migration files
- **Data Validation**: Validate all inputs before database operations

### 3. Security Implementation
- **Input Sanitization**: Validate and sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries exclusively
- **XSS Protection**: Implement proper output encoding
- **Rate Limiting**: Per-user and global rate limits using Vercel KV
- **Session Security**: Secure JWT implementation with proper expiration

### 4. Performance Optimization
- **Caching Strategy**: Use Vercel KV for frequently accessed data
- **Lazy Loading**: Implement code splitting and component lazy loading
- **Database Indexing**: Proper database indexes on frequently queried columns
- **API Response Optimization**: Minimize payload sizes and response times

### 5. Future Integration Preparation
- **Modular Architecture**: Separate concerns to easily add AI/AWS modules
- **API Abstraction**: Create service layers for external integrations
- **Configuration Management**: Centralized configuration for easy feature toggles
- **Plugin Architecture**: Design components to accept external service plugins

## Specific Implementation Notes

### WebSocket Integration
```typescript
// Example structure for WebSocket implementation
// /lib/websocket/connection.ts
// Should handle:
// - User authentication verification
// - Real-time approval notifications
// - Chat message broadcasting (future AI integration)
// - System status updates
// - Error handling and reconnection logic
```

### State Management Pattern
```typescript
// Example Zustand store structure
// /stores/chat-store.ts
interface ChatStore {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: Message[];
  isTyping: boolean;
  // Actions
  createSession: (name: string) => void;
  setCurrentSession: (id: string) => void;
  addMessage: (message: Message) => void;
  // Future AI integration methods
  sendToAI: (message: string) => Promise<void>;
}
```

### Component Architecture
- **Atomic Design Principles**: Build small, reusable components
- **Props Interface**: Define clear TypeScript interfaces for all props
- **Error Boundaries**: Implement error boundaries for graceful error handling
- **Accessibility**: Include proper ARIA labels and keyboard navigation
- **Responsive Design**: Mobile-first responsive design approach

## Testing Requirements
- **Unit Tests**: Test all utility functions and business logic
- **Integration Tests**: Test API endpoints and database operations
- **Component Tests**: Test React components with React Testing Library
- **E2E Tests**: Basic user workflow tests
- **Type Checking**: Ensure no TypeScript errors in strict mode

## Deliverable Expectations
1. **Complete, working codebase** following the specified architecture
2. **Comprehensive README.md** with setup instructions and API documentation
3. **Database migration scripts** for easy deployment
4. **Environment configuration guide** with all required variables
5. **Deployment guide** for Vercel platform
6. **Code documentation** with inline comments explaining complex logic
7. **Type definitions file** with all custom TypeScript interfaces

## Success Criteria
- ✅ Users can authenticate via EntraID and access role-appropriate features
- ✅ Chat interface is functional with message persistence and real-time updates
- ✅ Approval workflow operates correctly with proper notifications
- ✅ All database operations work reliably with proper error handling
- ✅ Rate limiting prevents abuse while maintaining good user experience
- ✅ Codebase is well-documented and easily maintainable
- ✅ Architecture supports future AI and AWS integration without major refactoring
- ✅ Application is production-ready and deployable on Vercel

**Remember: This is the foundation for a professional cloud management platform. Code quality, security, and maintainability are paramount. Every component should be built to enterprise standards with proper error handling, logging, and documentation.**
