Customer Authentication System - MongoDB Adapter Integration

Executive Summary

Implement NextAuth MongoDB adapter to enable database-backed sessions and prepare for customer
authentication. The adapter is already installed - we just need to configure it. This creates a
foundation for customers to create accounts, view booking history, and manage their profiles.

---

PHASE 1: MongoDB Adapter Foundation (Core Setup)

Task 1.1: Environment Variables Configuration

File: .env

Actions:

1.  Add NEXTAUTH_SECRET (copy from .env.production)
2.  Fix NEXTAUTH_URL format (remove /api/auth path)

Changes:

# BEFORE

NEXTAUTH_URL=http://localhost:3000/api/auth

# AFTER

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=8cc4c50963f9e13f38ac85145be652ed

Why:

- NEXTAUTH_SECRET is required for session encryption
- NEXTAUTH_URL should be base URL (NextAuth appends /api/auth automatically)

---

Task 1.2: Update NextAuth Configuration with MongoDB Adapter

File: auth.ts

Actions:

1.  Import MongoDB adapter and client
2.  Add adapter to authOptions
3.  Change session strategy from "jwt" to "database"
4.  Update signIn callback to set isAdmin field in database
5.  Add session callback to include isAdmin in session object

Code Changes:
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions: AuthOptions = {
adapter: MongoDBAdapter(clientPromise), // NEW: Add adapter

providers: [
GoogleProvider({
clientId: process.env.GOOGLE_CLIENT_ID || "",
clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
}),
],

session: {
strategy: "database", // CHANGED: from "jwt" to "database"
},

callbacks: {
// UPDATED: signIn callback with isAdmin logic
async signIn({ user, account, profile }) {
const allowedEmails = [
"crystaledgedev22@gmail.com",
"ashley@coastalcreationsstudio.com",
];

       // Check if email is in whitelist
       if (user.email && allowedEmails.includes(user.email)) {
         // Mark user as admin in database
         const client = await clientPromise;
         const db = client.db();
         await db.collection("users").updateOne(
           { email: user.email },
           { $set: { isAdmin: true } },
           { upsert: false }
         );
         return true;
       }

       return false; // Deny access to non-whitelisted emails
     },

     // NEW: session callback to include isAdmin in session
     async session({ session, user }) {
       // Add user ID and isAdmin flag to session
       if (session.user) {
         session.user.id = user.id;
         session.user.isAdmin = user.isAdmin || false;
       }
       return session;
     },

},
};

Database Collections Created Automatically:

- users - User profiles (email, name, image, isAdmin)
- accounts - OAuth provider data (Google tokens, provider IDs)
- sessions - Active sessions (sessionToken, userId, expires)

Why:

- Adapter handles all database operations automatically
- Database sessions enable instant session revocation
- isAdmin field stored in user document for role-based access

---

Task 1.3: TypeScript Type Definitions

File: types/next-auth.d.ts (CREATE NEW)

Actions:

1.  Create type declaration file
2.  Extend NextAuth User interface with isAdmin field
3.  Extend Session interface to include id and isAdmin

Code:
import "next-auth";

declare module "next-auth" {
/\*\*
_ Extend the built-in User type with custom fields
_/
interface User {
isAdmin?: boolean;
}

/\*\*
_ Extend the built-in Session type
_/
interface Session {
user: {
id: string;
email: string;
name?: string | null;
image?: string | null;
isAdmin?: boolean;
}
}
}

declare module "next-auth/jwt" {
/\*\*
_ Extend the built-in JWT type
_/
interface JWT {
isAdmin?: boolean;
}
}

Why:

- TypeScript strict mode requires proper type definitions
- Provides autocomplete and type safety for isAdmin field
- Follows NextAuth best practices for type extensions

---

Task 1.4: Verify No Breaking Changes

Files to Review: (Read-only verification)

- app/admin/dashboard/layout.tsx - Verify getServerSession still works
- components/authentication/LogoutButton.tsx - Verify logout flow

Expected Behavior:

- getServerSession(authOptions) works identically with database sessions
- Admin dashboard protection continues to work
- Logout functionality remains unchanged
- Only impact: Users must re-login (sessions invalidated by strategy change)

---

PHASE 2: User Model Planning (Database Schema)

Task 2.1: Understanding the Adapter Schema

Collections Managed by MongoDB Adapter:

users collection:
{
\_id: ObjectId,
email: string (unique),
emailVerified: Date | null,
name: string | null,
image: string | null,
isAdmin: boolean, // Custom field we add via callback
}

accounts collection:
{
\_id: ObjectId,
userId: ObjectId (ref to users),
type: "oauth",
provider: "google",
providerAccountId: string,
access_token: string,
refresh_token: string,
expires_at: number,
token_type: "Bearer",
scope: string,
id_token: string,
}

sessions collection:
{
\_id: ObjectId,
sessionToken: string (unique),
userId: ObjectId (ref to users),
expires: Date,
}

Indexes Created Automatically:

- users.email (unique)
- accounts.provider + providerAccountId (compound unique)
- sessions.sessionToken (unique)
- sessions.expires (for TTL/cleanup)

Why Let Adapter Manage These Collections:

- Automatic schema updates with adapter version upgrades
- Proper indexing handled automatically
- Session lifecycle management built-in
- No risk of schema drift
- Battle-tested by thousands of NextAuth users

---

Task 2.2: Linking Customers to Users (Future Enhancement)

File: lib/models/Customer.ts (PLAN ONLY - Don't implement yet)

Planned Enhancement:
interface ICustomer extends Document {
// ... existing fields

// NEW: Optional link to authenticated user
userId?: string; // References NextAuth users.\_id

// ... rest of fields
}

const CustomerSchema = new Schema<ICustomer>({
// ... existing schema

userId: {
type: String,
required: false,
ref: "users", // Reference to NextAuth users collection
},

// ... rest of schema
});

Usage in Booking Flow (Future):
// In app/actions/actions.ts or booking API
const session = await getServerSession(authOptions);

const customerData = {
event: eventId,
billingInfo: { ... },
userId: session?.user?.id || null, // Link if authenticated, null if guest
};

Benefits:

- Customers can view booking history
- Pre-fill billing info from profile
- Manage multiple bookings from one account
- Guest checkout still supported (userId = null)

---

PHASE 3: Customer Authentication Pages (Future Implementation)

Task 3.1: Registration Page

File: app/(auth)/register/page.tsx (CREATE LATER)

Functionality:

- Email + password registration form
- OR "Sign up with Google" button
- Validation: email format, password strength
- Create user in database via NextAuth
- Send welcome email
- Redirect to login

---

Task 3.2: Login Page

File: app/(auth)/login/page.tsx (CREATE LATER)

Functionality:

- Email + password login form
- OR "Sign in with Google" button
- "Forgot password?" link
- Redirect to customer dashboard after login

---

Task 3.3: Customer Dashboard

File: app/my-account/page.tsx (CREATE LATER)

Functionality:

- Protected route (requires authentication)
- View booking history
- See upcoming events
- Manage profile
- Logout button

---

PHASE 4: Testing & Validation

Task 4.1: Development Testing Checklist

Test Scenarios:

1.  Admin Login Flow:

- Sign in with ashley@coastalcreationsstudio.com
- Verify user document created in users collection
- Verify isAdmin: true in user document
- Verify session created in sessions collection
- Access admin dashboard successfully
- Sign out, verify session deleted

2.  Non-Admin Prevention:

- Attempt sign in with non-whitelisted email
- Verify sign-in blocked (callback returns false)
- Verify NO user document created
- Verify error page or denied message shown

3.  Database Verification:

- Connect to MongoDB Atlas
- Verify users collection exists
- Verify accounts collection exists
- Verify sessions collection exists
- Check indexes created properly

4.  Session Persistence:

- Sign in as admin
- Restart dev server
- Verify still logged in (session persists)
- Check session expiry (default 30 days)

5.  Existing Functionality:

- Admin dashboard loads correctly
- Can view customers
- Can process bookings
- Can manage events
- No TypeScript errors

---

Task 4.2: Production Deployment Checklist

Pre-Deployment:

- Verify NEXTAUTH_SECRET in production environment variables
- Verify NEXTAUTH_URL points to production domain
- Test in staging/preview environment first
- Notify admin users: "You'll need to log in again after deployment"

Post-Deployment:

- Test admin login on production
- Verify MongoDB collections created
- Monitor error logs for auth issues
- Verify admin dashboard accessible

---

IMPLEMENTATION TIMELINE

Immediate (Phase 1) - Core Setup

Estimated Time: 1-2 hours

1.  Update .env (5 minutes)
2.  Update auth.ts with adapter (20 minutes)
3.  Create types/next-auth.d.ts (10 minutes)
4.  Test admin login flow (20 minutes)
5.  Verify database collections (10 minutes)
6.  Test sign-out flow (10 minutes)

Deliverable: Database-backed sessions with isAdmin field working

---

Short-Term (Phase 2) - User Model Planning

Estimated Time: 30 minutes

1.  Document adapter schema (15 minutes)
2.  Plan Customer model enhancement (15 minutes)

Deliverable: Clear understanding of user data structure

---

Medium-Term (Phase 3) - Customer Pages

Estimated Time: 8-12 hours (FUTURE WORK)

1.  Create registration page (2 hours)
2.  Create login page (2 hours)
3.  Create customer dashboard (4 hours)
4.  Update navigation (1 hour)
5.  Add customer API routes (2 hours)
6.  Testing (1-2 hours)

Deliverable: Full customer authentication system

---

TECHNICAL ARCHITECTURE

Database Structure

MongoDB Database (studio-cluster-1)
├── users (NextAuth adapter)
│ ├── \_id: ObjectId
│ ├── email: string (unique)
│ ├── name: string
│ ├── image: string
│ ├── isAdmin: boolean ← Custom field
│ └── emailVerified: Date
│
├── accounts (NextAuth adapter)
│ ├── \_id: ObjectId
│ ├── userId: ObjectId → users.\_id
│ ├── provider: "google"
│ └── [OAuth tokens]
│
├── sessions (NextAuth adapter)
│ ├── \_id: ObjectId
│ ├── sessionToken: string (unique)
│ ├── userId: ObjectId → users.\_id
│ └── expires: Date
│
├── customers (Mongoose - existing)
│ ├── \_id: ObjectId
│ ├── userId?: string → users.\_id ← Future enhancement
│ ├── event: ObjectId → events
│ ├── billingInfo: {...}
│ └── [rest of booking data]
│
├── events (Mongoose - existing)
├── reservations (Mongoose - existing)
└── privateevents (Mongoose - existing)

Authentication Flow

User Authentication Flow:

1.  User navigates to protected route
2.  Middleware checks for session cookie
3.  NextAuth queries sessions collection by sessionToken
4.  Looks up user by userId from session
5.  Returns user object with isAdmin field
6.  Route allows/denies based on isAdmin

Google OAuth Flow:

1.  User clicks "Sign in with Google"
2.  Redirected to Google consent screen
3.  Google redirects back with authorization code
4.  NextAuth exchanges code for tokens
5.  signIn callback checks email whitelist
6.  If allowed:
    - Creates user in users collection (or finds existing)
    - Creates account in accounts collection (stores tokens)
    - Creates session in sessions collection
    - Sets isAdmin: true via callback
    - Sets session cookie with sessionToken
7.  User redirected to admin dashboard

---

SECURITY CONSIDERATIONS

Session Security

- Session Tokens: Cryptographically secure random strings
- Cookie Security: HttpOnly, Secure (production), SameSite
- Session Expiry: Default 30 days (configurable)
- Token Rotation: Automatic on every session read

Access Control

- Email Whitelist: Enforced in signIn callback (prevents unwanted user creation)
- isAdmin Field: Server-side only, not editable by user
- Route Protection: Verified on every request via getServerSession
- Database Queries: User can only query their own data (userId filter)

Data Protection

- OAuth Tokens: Encrypted in database (adapter handles encryption)
- Session Tokens: Hashed before storage
- User Data: Minimal exposure in session object
- CSRF Protection: Built into NextAuth

---

ROLLBACK PLAN

If Issues Arise During Implementation

Quick Rollback:

1.  Change auth.ts:
    // Comment out adapter
    // adapter: MongoDBAdapter(clientPromise),

// Change back to JWT
session: {
strategy: "jwt",
}, 2. Restart development server 3. Admin users re-login (JWT sessions created) 4. Everything works as before

Data Impact:

- User documents in MongoDB remain (harmless)
- Can delete collections manually if needed
- No impact on existing data (Events, Customers, etc.)

---

SUCCESS CRITERIA

Phase 1 Complete When:

- ✅ Admin can sign in with Google
- ✅ User document created in users collection with isAdmin: true
- ✅ Session persists across server restarts
- ✅ Admin dashboard accessible with database sessions
- ✅ Non-whitelisted emails cannot sign in
- ✅ TypeScript compiles with no errors
- ✅ All existing functionality works

Future Phases Complete When:

- ✅ Customers can create accounts (email/password OR Google)
- ✅ Customers can view booking history
- ✅ Customer bookings linked to user accounts
- ✅ Guest checkout still available
- ✅ Mobile responsive customer dashboard

---

FILE CHANGES SUMMARY

Files to Modify:

1.  .env - Add NEXTAUTH_SECRET, fix NEXTAUTH_URL
2.  auth.ts - Add adapter, change session strategy, update callbacks
3.  types/next-auth.d.ts - Create new type definitions

Files to Create (Future):

4.  app/(auth)/login/page.tsx
5.  app/(auth)/register/page.tsx
6.  app/my-account/page.tsx
7.  app/my-account/bookings/page.tsx
8.  components/customer/BookingCard.tsx

Files That DON'T Need Changes:

- app/admin/dashboard/layout.tsx - getServerSession works identically
- lib/mongoose.ts - Mongoose remains unchanged
- lib/mongodb.ts - Already perfect for adapter
- lib/models/Customer.ts - No changes until Phase 2
- All existing API routes - Continue working

---

DEPENDENCIES STATUS

Already Installed ✅

{
"@auth/mongodb-adapter": "^3.9.1",
"mongodb": "^6.16.0",
"mongoose": "^8.14.1",
"next-auth": "^4.24.11"
}

No Additional Packages Needed

Everything required is already in package.json!

---

REFERENCES

- NextAuth MongoDB Adapter: https://authj
- NextAuth Documentation: https://next-
- NextAuth GitHub: https://githu
- NextAuth TypeScript: https://next-

---

NEXT STEPS

1.  Review this plan - Ensure you understand each phase
2.  Approve to proceed - I'll start with Phase 1 (environment + auth.ts updates)
3.  Test together - Verify admin login works with database sessions
4.  Plan Phase 3 - Customer registration/login (separate work session)
