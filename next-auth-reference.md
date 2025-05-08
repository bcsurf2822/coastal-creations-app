# Complete Google Authentication with Next-Auth for Next.js 15 with TypeScript

This guide will walk you through implementing Google authentication in your existing Next.js 15 project using next-auth with TypeScript and the app router pattern.

## Prerequisites

- Existing Next.js 15+ project with TypeScript
- App router configured
- Google Cloud Console account for OAuth credentials

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" tab
5. Create credentials → OAuth client ID
6. Configure OAuth consent screen if needed
7. Choose "Web application" as the application type
8. Add authorized JavaScript origins: `http://localhost:3000`
9. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
10. Copy the Client ID and Client Secret

## Step 2: Installation

Install next-auth:

```bash
npm install next-auth
# or
yarn add next-auth
# or
pnpm add next-auth
```

## Step 3: Configure Environment Variables

Create or update your `.env.local` file:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google Provider
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Generate a secret key using:
```bash
openssl rand -base64 32
```

## Step 4: Create NextAuth Configuration

Create a new file at `lib/auth.ts`:

```typescript
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Save the access token and refresh token in the JWT on the initial login
      if (user && account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login', // Custom login page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

// Refresh access token function
async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token"
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    })

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.log(error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}
```

## Step 5: Create API Route for NextAuth

Create a new file at `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

## Step 6: Create Auth Provider Component

Create `components/providers/auth-provider.tsx`:

```typescript
"use client"

import { SessionProvider } from "next-auth/react"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}
```

## Step 7: Add Provider to Root Layout

Update your `app/layout.tsx`:

```typescript
import { AuthProvider } from "@/components/providers/auth-provider"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Step 8: Create Login Page

Create `app/login/page.tsx`:

```typescript
"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard') // Redirect to dashboard or home
    }
  }, [session, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your Google account to continue
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
```

## Step 9: Create Protected Route Component

Create `components/auth/protected-route.tsx`:

```typescript
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}
```

## Step 10: Create Dashboard Example

Create `app/dashboard/page.tsx`:

```typescript
"use client"

import { useSession, signOut } from "next-auth/react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import Image from "next/image"

function DashboardContent() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4 mb-6">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={60}
                height={60}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-600">
                Welcome, {session?.user?.name || session?.user?.email}!
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-3">User Information</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{session?.user?.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{session?.user?.email}</dd>
              </div>
            </dl>
          </div>
          
          <div className="mt-6">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
```

## Step 11: Create Type Extensions

Create `types/next-auth.d.ts` to extend NextAuth types:

```typescript
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
    }
    accessToken?: string
  }

  interface User {
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
  }
}
```

## Step 12: Server-Side Session Handling

Create `lib/get-server-session.ts`:

```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function getSessionServer() {
  const session = await getServerSession(authOptions)
  return session
}
```

Example server component with authentication:

```typescript
import { getSessionServer } from "@/lib/get-server-session"
import { redirect } from "next/navigation"

export default async function ServerProtectedPage() {
  const session = await getSessionServer()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Protected Server Component</h1>
        <p>Welcome, {session.user.name}!</p>
        <p className="text-gray-600">This page can only be accessed by authenticated users.</p>
      </div>
    </div>
  )
}
```

## Step 13: Add Navigation with Auth State

Create `components/navigation.tsx`:

```typescript
"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"

export function Navigation() {
  const { data: session, status } = useSession()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-4 text-sm font-medium text-gray-700 hover:text-gray-900">
              Home
            </Link>
            {session && (
              <Link href="/dashboard" className="flex items-center px-4 text-sm font-medium text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2">
                  {session.user.image && (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">{session.user.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

## Step 14: Update Root Layout with Navigation

Update your `app/layout.tsx` to include navigation:

```typescript
import { AuthProvider } from "@/components/providers/auth-provider"
import { Navigation } from "@/components/navigation"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Step 15: Create Home Page

Update `app/page.tsx`:

```typescript
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to Your App
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          This is a Next.js 15 application with Google authentication powered by NextAuth.
          Sign in to access protected features.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get started
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Go to Dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

## Summary

You've now successfully implemented Google authentication in your Next.js 15 project! Key features include:

1. Google OAuth integration
2. Custom login page with Google branding
3. Protected routes (both client and server-side)
4. JWT session management
5. Token refresh functionality
6. Type-safe implementation
7. Tailwind CSS styling
8. User profile display with avatar

## Best Practices

1. Always use HTTPS in production
2. Keep secrets secure and never commit them
3. Update callback URLs in Google Console for production
4. Implement proper error handling
5. Consider rate limiting
6. Regularly update next-auth

## Production Checklist

Before deploying:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production domain to Google Console
3. Set production environment variables
4. Enable HTTPS
5. Test authentication flow in production environment

Remember to thoroughly test in both development and production environments!