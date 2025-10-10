# AI Chatbot Platform

Enterprise-grade AI chatbot platform with approval workflows, built with Next.js 14 and TypeScript.

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Neon Postgres (Vercel Postgres compatible)
- **Cache**: Upstash Redis (Vercel KV compatible)
- **Authentication**: EntraID (Azure AD OIDC)
- **Styling**: Tailwind CSS (dark theme)
- **State Management**: Zustand (to be added)
- **Real-time**: WebSocket (to be implemented)

## 📋 Current Status

**Phase 1: Complete ✅**

- ✅ Next.js 14 project initialized with TypeScript strict mode
- ✅ Tailwind CSS configured with dark theme
- ✅ Database connection to Neon Postgres working
- ✅ KV connection to Upstash Redis working
- ✅ All database tables created (users, approvals, chat, activity logs)
- ✅ Database functions and triggers deployed
- ✅ Base folder structure created
- ✅ Type definitions implemented
- ✅ Utility libraries (logger, errors) created

## 🗄️ Database Schema

- **users** - User management with EntraID integration
- **approval_requests** - Approval workflow with 24hr expiration
- **activity_logs** - Comprehensive audit trail
- **chat_sessions** - Chat conversation management
- **chat_messages** - Message history storage

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20+
- npm or yarn
- Neon Postgres database
- Upstash Redis instance
- Azure AD (EntraID) app registration

### Installation

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in your credentials
3. Install dependencies:

```bash
npm install
```

4. Run database migrations:

```bash
npm run db:migrate
node scripts/migrate-functions.js
```

5. Test connections:

Start the dev server and visit http://localhost:3000/api/test

```bash
npm run dev
```

### Environment Variables

See `.env.local.example` for all required environment variables.

**Critical Variables:**
- `DATABASE_URL` - Neon Postgres connection string
- `KV_REST_API_URL` - Upstash Redis URL
- `KV_REST_API_TOKEN` - Upstash Redis token
- `AZURE_AD_CLIENT_ID` - EntraID client ID
- `AZURE_AD_CLIENT_SECRET` - EntraID client secret
- `AZURE_AD_TENANT_ID` - EntraID tenant ID
- `JWT_SECRET` - Secret for JWT signing
- `NEXTAUTH_SECRET` - NextAuth secret

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Dashboard route group
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── chat/             # Chat components
│   ├── dashboard/        # Dashboard components
│   ├── approval/         # Approval components
│   └── layout/           # Layout components
├── lib/                   # Library code
│   ├── auth/             # Authentication
│   ├── database/         # Database operations
│   ├── security/         # Security utilities
│   ├── websocket/        # WebSocket server
│   ├── analytics/        # Analytics processing
│   ├── approval/         # Approval workflow
│   ├── kv/               # KV operations
│   └── utils/            # Utility functions
├── types/                 # TypeScript definitions
├── hooks/                 # React hooks
├── stores/                # Zustand stores
└── scripts/               # Utility scripts
```

## 🧪 Testing Connections

Test database and KV connections:

```bash
npm run dev
# Visit http://localhost:3000/api/test
```

Expected response:
```json
{
  "success": true,
  "database": true,
  "kv": true,
  "errors": [],
  "message": "All connections successful!"
}
```

## 📝 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:migrate   # Run database migrations
```

## 🔐 Security Features

- TypeScript strict mode for type safety
- Input validation on all endpoints (to be implemented)
- Rate limiting with Redis (to be implemented)
- CSRF protection (to be implemented)
- Security headers middleware (to be implemented)
- Parameterized SQL queries (preventing SQL injection)
- JWT session management (to be implemented)

## 🚧 Next Steps (Phase 2)

- [ ] Implement EntraID OIDC authentication
- [ ] Create JWT session management
- [ ] Build auth middleware
- [ ] Create login/logout flows
- [ ] Implement session refresh mechanism

## 📊 Database Maintenance

The database includes utility functions:

1. **expire_old_approval_requests()** - Expires approval requests older than 24 hours
2. **get_user_activity_summary(user_id, days)** - Get user activity statistics
3. **update_updated_at_column()** - Auto-update timestamps on chat sessions

## 🤝 Contributing

This is a production project. Follow code quality standards:
- All functions must have JSDoc comments
- TypeScript strict mode compliance
- Proper error handling with try-catch
- No code duplication
- Input validation on all endpoints

## 📄 License

ISC

## 👤 Author

Development in progress - Phase 1 completed on 2025-10-01

---

**Note**: This project uses temporary database credentials. Replace them with production credentials before deployment.
