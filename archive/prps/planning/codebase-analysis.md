# Codebase Analysis for Stripe Payment Integration

## Executive Summary

This document provides a comprehensive analysis of the existing codebase architecture and patterns for implementing a Stripe payment integration feature. The codebase follows a modern full-stack architecture with React/TypeScript frontend, FastAPI backend, Supabase database, and Docker containerization.

## 1. Project Structure Overview

### Root Level Architecture
```
ai-coding-workshop/
├── frontend/                 # React TypeScript frontend with Vite
├── backend_agent_api/        # FastAPI backend service
├── backend_rag_pipeline/     # RAG processing service
├── sql/                      # Database schema and migrations
├── PRPs/                     # Planning & Research Packages
├── docker-compose.yml        # Multi-service orchestration
├── .env.example             # Environment configuration template
└── deployment files         # Caddy, deploy scripts
```

### Key Configuration Files
- **Frontend**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/package.json` - React with Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/backend_agent_api/requirements.txt` - FastAPI with Pydantic AI, Supabase integration
- **Docker**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/docker-compose.yml` - Multi-service architecture with health checks
- **Database**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/sql/0-all-tables.sql` - PostgreSQL with Supabase RLS policies

## 2. Frontend Analysis

### Framework & Dependencies
- **Core**: React 18.3.1 with TypeScript and Vite build system
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with `tailwindcss-animate` for animations
- **Forms**: `react-hook-form` with `@hookform/resolvers` and `zod` validation
- **State Management**: React Context for auth, `@tanstack/react-query` for server state
- **Routing**: `react-router-dom` v6 with protected routes
- **Database**: `@supabase/supabase-js` for backend communication

### Component Structure & Patterns
```
frontend/src/
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── auth/                 # Authentication components
│   ├── chat/                 # Chat interface components
│   ├── sidebar/              # Navigation components
│   ├── payments/             # Empty - ready for Stripe components
│   └── admin/                # Admin interface components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and configurations
├── pages/                    # Route components
└── types/                    # TypeScript type definitions
```

### Key Files for Stripe Integration
- **Authentication Context**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/hooks/useAuth.tsx` - User session management
- **Form Components**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/components/ui/form.tsx` - React Hook Form integration
- **Supabase Client**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/lib/supabase.ts` - Database connection
- **Type Definitions**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/types/database.types.ts` - Database schema types

### Naming Conventions
- **Components**: PascalCase (e.g., `ChatLayout`, `AuthProvider`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`, `useToast`)
- **Files**: kebab-case for UI components, PascalCase for page components
- **CSS Classes**: Tailwind utility classes with `cn()` utility for conditional styling

### API Integration Patterns
- Uses environment variables: `VITE_SUPABASE_URL`, `VITE_AGENT_ENDPOINT`
- Supabase client for authentication and database operations
- React Query for server state management and caching
- Custom hooks for data fetching and mutations

## 3. Backend Analysis

### Framework & Architecture
- **Core**: FastAPI 0.115.12 with async/await patterns
- **AI Integration**: `pydantic-ai` for agent functionality
- **Database**: Supabase integration with `asyncpg` for PostgreSQL
- **Authentication**: JWT tokens with Supabase auth integration
- **Memory**: `mem0ai` for long-term conversation memory

### Application Structure
```
backend_agent_api/
├── agent_api.py             # Main FastAPI application and routes
├── agent.py                 # Pydantic AI agent configuration
├── db_utils.py              # Database utility functions
├── tools.py                 # AI agent tools and capabilities
├── clients.py               # External service clients
├── configure_langfuse.py    # Observability configuration
└── tests/                   # Comprehensive test suite
```

### Key Patterns for Stripe Integration
- **Database Functions**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/backend_agent_api/db_utils.py` - Session management, user operations
- **API Routes**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/backend_agent_api/agent_api.py` - FastAPI endpoint patterns with auth
- **Client Management**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/backend_agent_api/clients.py` - External API integration patterns

### Authentication & Authorization
- Supabase JWT token validation
- User profile management with admin/user role separation
- Row Level Security (RLS) policies in database
- Rate limiting implementation for API endpoints

### Environment Configuration
- Follows 12-factor app methodology
- Environment variables for all external services
- Separate development/production configurations
- Service health checks for Docker deployment

## 4. Database Schema Analysis

### Core Tables
```sql
-- User management
user_profiles(id, email, full_name, is_admin, created_at, updated_at)
requests(id, user_id, timestamp, user_query)

-- Chat system
conversations(session_id, user_id, title, created_at, last_message_at, is_archived, metadata)
messages(id, session_id, message, message_data, created_at)

-- Document management
document_metadata(id, title, url, created_at, schema)
documents(id, content, metadata, embedding)
```

### Key Patterns for Stripe Integration
- **User Profiles**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/sql/0-all-tables.sql` line 95-102 - User management structure
- **UUID Primary Keys**: Consistent use of UUIDs for user-related entities
- **Timestamps**: `TIMESTAMP WITH TIME ZONE` for all time fields
- **JSONB Metadata**: Flexible metadata storage pattern in conversations table
- **RLS Policies**: Row Level Security for data isolation

### Migration Patterns
- Numbered SQL files for sequential execution
- Separate files for tables, policies, and functions
- Safe DROP statements with IF EXISTS checks
- Clear separation of concerns (tables, RLS, functions)

### Recommended Stripe Table Structure
Following existing patterns, payment tables should include:
```sql
-- Payment subscriptions
user_subscriptions(
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods
payment_methods(
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    stripe_payment_method_id TEXT,
    type TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. Environment and Configuration Patterns

### Environment Variables Structure
Based on `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/.env.example`:

- **Service Configuration**: Clear prefixes (LLM_, EMBEDDING_, VITE_)
- **Security**: Separate keys for different environments
- **URLs**: Full URLs with fallback defaults
- **Feature Flags**: Boolean environment variables for optional features

### Recommended Stripe Environment Variables
```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

### Docker Configuration
- Multi-service architecture with service dependencies
- Health checks for all services
- Environment variable injection
- Volume mounts for persistent data

## 6. Testing Patterns and Approaches

### Frontend Testing
- **Framework**: Playwright for end-to-end testing
- **Mocking**: Comprehensive mock setup in `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/tests/mocks.ts`
- **Patterns**: Page object pattern, authentication state management

### Backend Testing
- **Framework**: pytest with async support (`pytest-asyncio`)
- **Mocking**: Extensive use of `unittest.mock` for external dependencies
- **Structure**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/backend_agent_api/tests/test_tools.py` shows comprehensive test patterns
- **Coverage**: Web search, embeddings, document tools, image analysis, code execution

### Testing Conventions
- **File Naming**: `test_*.py` for backend, `*.spec.ts` for frontend
- **Test Classes**: Organized by functionality (e.g., `TestWebSearchTools`)
- **Async Testing**: Proper async/await patterns with mocking
- **Environment Isolation**: Mock environment variables for testing

### Recommended Stripe Testing Approach
```python
# Backend testing pattern for Stripe
class TestStripeIntegration:
    @pytest.mark.asyncio
    @patch('stripe.Customer.create')
    async def test_create_customer_success(self, mock_stripe_create):
        # Mock Stripe response
        mock_customer = MagicMock()
        mock_customer.id = 'cus_test123'
        mock_stripe_create.return_value = mock_customer

        # Test customer creation
        result = await create_stripe_customer(user_id="test-user", email="test@example.com")

        # Assertions
        assert result.customer_id == 'cus_test123'
        mock_stripe_create.assert_called_once()
```

## 7. Integration Recommendations

### Where to Place Stripe Code

#### Frontend Structure
```
frontend/src/
├── components/
│   └── payments/
│       ├── StripeProvider.tsx       # Stripe Elements provider
│       ├── PaymentForm.tsx          # Payment method form
│       ├── SubscriptionCard.tsx     # Subscription management
│       └── BillingHistory.tsx       # Payment history
├── hooks/
│   ├── useStripe.tsx               # Stripe integration hook
│   └── useSubscription.tsx         # Subscription management
└── pages/
    ├── Billing.tsx                 # Billing management page
    └── Checkout.tsx                # Payment checkout page
```

#### Backend Structure
```
backend_agent_api/
├── stripe_utils.py                 # Stripe integration utilities
├── billing_routes.py               # Payment/billing API routes
└── webhook_handlers.py             # Stripe webhook handlers
```

#### Database Structure
```
sql/
├── 10-payment-tables.sql           # Payment-related tables
└── 11-payment-policies.sql         # RLS policies for payment data
```

### API Endpoint Patterns
Following existing patterns in `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/backend_agent_api/agent_api.py`:

```python
@app.post("/api/create-payment-intent")
async def create_payment_intent(
    request: CreatePaymentIntentRequest,
    auth_header: HTTPAuthorizationCredentials = Security(security)
) -> PaymentIntentResponse:
    # JWT validation
    payload = jwt.decode(auth_header.credentials, options={"verify_signature": False})
    user_id = payload.get("sub")

    # Rate limiting
    await check_rate_limit(supabase, user_id, "payment_intent")

    # Stripe integration
    intent = await create_stripe_payment_intent(user_id, request.amount)

    return PaymentIntentResponse(client_secret=intent.client_secret)
```

### Environment Integration
Add to existing environment variable structure:
```bash
# Add to .env.example
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 8. Existing Payment Infrastructure

### Current Payment Directory
- **Location**: `/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/components/payments/` (empty)
- **Status**: Directory exists but contains no components
- **Opportunity**: Ready for Stripe component implementation

### Related Dependencies
- **Forms**: `react-hook-form` and `zod` already configured for form validation
- **UI Components**: shadcn/ui provides card, button, input components suitable for payment forms
- **HTTP Client**: Can use Supabase client or add `axios`/`fetch` for Stripe API calls

## 9. Security Considerations

### Current Security Patterns
- JWT token validation in FastAPI routes
- Row Level Security (RLS) policies in Supabase
- Environment variable management for API keys
- CORS configuration for cross-origin requests

### Stripe Security Requirements
- Never expose secret keys in frontend code
- Use Stripe publishable keys only in frontend
- Implement webhook signature validation
- Follow PCI compliance guidelines for payment data

### Recommended Security Implementation
```python
# Backend webhook validation
@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(400, "Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")

    # Process webhook event
    await handle_stripe_event(event)
```

## 10. Next Steps and Implementation Priorities

### Phase 1: Foundation Setup
1. Add Stripe dependencies to both frontend and backend
2. Create database tables for payment data
3. Set up environment variables for Stripe keys
4. Implement basic Stripe customer creation

### Phase 2: Payment Components
1. Create Stripe Elements provider component
2. Build payment form with validation
3. Implement subscription management UI
4. Add billing history display

### Phase 3: Backend Integration
1. Create Stripe webhook handlers
2. Implement subscription lifecycle management
3. Add payment intent creation endpoints
4. Set up proper error handling and logging

### Phase 4: Testing & Security
1. Add comprehensive tests for payment flows
2. Implement webhook signature validation
3. Add rate limiting for payment endpoints
4. Conduct security review of payment data handling

## Conclusion

The codebase demonstrates strong architectural patterns that will support a robust Stripe payment integration. The existing authentication system, database schema patterns, form handling, and API structure provide an excellent foundation for adding payment functionality. The modular component structure and comprehensive testing patterns ensure that payment features can be added with confidence and maintainability.

Key strengths for Stripe integration:
- Established user authentication and session management
- Robust form handling with validation
- Comprehensive database schema patterns
- Strong testing infrastructure
- Secure environment variable management
- Clear separation of concerns between frontend and backend

The recommended implementation should follow the established patterns for consistency and maintainability, ensuring the payment integration feels native to the existing application architecture.