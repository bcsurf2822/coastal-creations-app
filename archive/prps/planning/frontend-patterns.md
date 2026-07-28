# Frontend Architecture Patterns for Payment Integration

## Overview

This document provides detailed analysis of the existing frontend architecture and patterns to ensure seamless integration of new Stripe payment components. The application is built with React, TypeScript, Vite, and uses Shadcn/ui components with Tailwind CSS.

## Tech Stack Analysis

### Core Technologies
- **React 18.3.1** with TypeScript
- **Vite** as build tool
- **React Router DOM 6.26.2** for routing
- **Shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** with dark theme enforcement
- **React Hook Form 7.53.0** for form management
- **@tanstack/react-query 5.56.2** for data fetching
- **Supabase** for authentication and backend
- **Zod 3.23.8** for validation

## Component Architecture Patterns

### 1. Form Components Structure

The application follows a consistent form pattern using React Hook Form with Shadcn/ui components:

**Example: Authentication Form Pattern (`/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/components/auth/AuthForm.tsx`)**

```tsx
interface FormProps {
  // Define form data interface
}

export const PaymentForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      // Set defaults
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // API call logic
      toast({
        title: "Success message",
        description: "Success description",
      });
    } catch (error) {
      toast({
        title: "Error title",
        description: (error as Error)?.message || "Fallback error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[350px] mx-4">
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
        <CardDescription>Form description</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Form fields */}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Loading text...
              </>
            ) : (
              'Submit text'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
```

### 2. Modal/Dialog Pattern

**Example: Settings Modal Pattern (`/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/components/sidebar/SettingsModal.tsx`)**

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Additional props
}

export const PaymentModal = ({ isOpen, onClose }: ModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {/* Form content */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

## Routing Structure Patterns

### Current Routing Setup (`/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/App.tsx`)

```tsx
// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Route structure
<Routes>
  <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
  <Route path="/" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Recommended Payment Routes Structure

```tsx
// Add these routes to the existing structure:
<Route 
  path="/billing" 
  element={
    <ProtectedRoute>
      <Billing />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/billing/upgrade" 
  element={
    <ProtectedRoute>
      <UpgradePlan />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/billing/success" 
  element={
    <ProtectedRoute>
      <PaymentSuccess />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/billing/cancel" 
  element={
    <ProtectedRoute>
      <PaymentCancel />
    </ProtectedRoute>
  } 
/>
```

## API Integration Patterns

### Current API Pattern (`/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/lib/api.ts`)

The application uses a direct fetch approach with error handling:

```tsx
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': access_token ? `Bearer ${access_token}` : '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
```

### Recommended Payment API Pattern

```tsx
// Create: src/lib/stripe-api.ts
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  access_token?: string
): Promise<PaymentIntentResponse> => {
  try {
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': access_token ? `Bearer ${access_token}` : '',
      },
      body: JSON.stringify({ amount, currency }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Payment API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Payment API error:', error);
    throw error;
  }
};
```

## Authentication Integration

### Current Auth Pattern (`/Users/benjamincorbett/code/ai_workflows/ai-coding-workshop/frontend/src/hooks/useAuth.tsx`)

The application uses Supabase Auth with Context API:

```tsx
// Auth context provides:
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null, data: unknown }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

// Usage in components:
const { user, session, loading } = useAuth();
```

### Payment Components Auth Integration

```tsx
// Payment components should use auth context:
export const PaymentComponent = () => {
  const { user, session } = useAuth();
  
  // Use user.id for customer identification
  // Use session.access_token for API authentication
};
```

## State Management Patterns

### Loading States

The application consistently uses local loading states with visual feedback:

```tsx
const [loading, setLoading] = useState(false);

// In buttons:
<Button disabled={loading}>
  {loading ? (
    <>
      <Loader className="mr-2 h-4 w-4 animate-spin" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

### Toast Notifications

Consistent toast pattern using Shadcn/ui toast system:

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success toast
toast({
  title: "Success",
  description: "Operation completed successfully.",
});

// Error toast
toast({
  title: "Error",
  description: "Operation failed. Please try again.",
  variant: "destructive",
});
```

## UI/UX Patterns

### Color Scheme
- **Primary Blue**: `bg-blue-500 hover:bg-blue-600` for primary actions
- **Dark Theme Enforced**: Application forces dark theme
- **Consistent Spacing**: Uses Tailwind spacing classes (`space-y-4`, `gap-4`, etc.)

### Button Variants
```tsx
// Primary action (payments, submissions)
<Button variant="default">Primary Action</Button>

// Secondary actions
<Button variant="outline">Secondary Action</Button>

// Destructive actions (cancellations)
<Button variant="destructive">Cancel Subscription</Button>
```

### Form Validation
```tsx
// Error display pattern
{errors.fieldName && (
  <p className="text-sm text-destructive">
    {errors.fieldName.message}
  </p>
)}
```

## File Organization for Payment Components

### Recommended Directory Structure

```
src/
├── components/
│   ├── payment/
│   │   ├── PaymentForm.tsx
│   │   ├── SubscriptionCard.tsx
│   │   ├── PlanSelector.tsx
│   │   ├── PaymentMethod.tsx
│   │   └── BillingHistory.tsx
│   ├── billing/
│   │   ├── BillingDashboard.tsx
│   │   ├── InvoiceList.tsx
│   │   └── UsageMetrics.tsx
├── hooks/
│   ├── useStripe.ts
│   ├── useSubscription.ts
│   └── usePaymentMethods.ts
├── lib/
│   ├── stripe-api.ts
│   └── payment-utils.ts
├── types/
│   └── payment.types.ts
└── pages/
    ├── Billing.tsx
    ├── UpgradePlan.tsx
    ├── PaymentSuccess.tsx
    └── PaymentCancel.tsx
```

### Component Naming Conventions

- **Components**: PascalCase (`PaymentForm`, `SubscriptionCard`)
- **Files**: PascalCase for components (`PaymentForm.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useStripe.ts`)
- **Types**: camelCase with descriptive suffix (`payment.types.ts`)

## Styling and Theming

### Tailwind Configuration
The application uses a comprehensive Tailwind setup with dark theme:

```tsx
// Consistent class patterns:
className={cn(
  "base-classes",
  conditionalClasses && "conditional-classes",
  className
)}
```

### Card Layout Pattern
```tsx
<Card className="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Content */}
  </CardContent>
  <CardFooter className="flex justify-between">
    {/* Actions */}
  </CardFooter>
</Card>
```

## Error Handling Patterns

### API Error Handling
```tsx
try {
  // API call
} catch (error) {
  console.error('Operation failed:', error);
  toast({
    title: "Operation failed",
    description: (error as Error)?.message || "An unexpected error occurred",
    variant: "destructive",
  });
  throw error; // Re-throw if needed for component logic
}
```

### Form Validation
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  defaultValues: {
    // defaults
  },
});

// In JSX:
<Input
  {...register("fieldName", { 
    required: "Field is required",
    pattern: {
      value: /pattern/,
      message: "Invalid format"
    }
  })}
/>
```

## Payment-Specific Implementation Guidelines

### 1. Stripe Integration Pattern
```tsx
// hooks/useStripe.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const processPayment = async (paymentIntent: string) => {
    setLoading(true);
    try {
      const stripe = await stripePromise;
      // Process payment
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { processPayment, loading };
};
```

### 2. Subscription Management Pattern
```tsx
// components/payment/SubscriptionCard.tsx
export const SubscriptionCard = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSubscription();
  }, [user]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">Loading subscription...</div>
        ) : (
          // Subscription details
        )}
      </CardContent>
    </Card>
  );
};
```

### 3. Payment Form Pattern
```tsx
// components/payment/PaymentForm.tsx
export const PaymentForm = ({ planId, onSuccess }: PaymentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentData>();
  
  const onSubmit = async (data: PaymentData) => {
    setProcessing(true);
    try {
      // Create payment intent
      // Process payment
      // Handle success
      toast({
        title: "Payment successful",
        description: "Your subscription has been activated.",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Payment failed",
        description: (error as Error)?.message || "Payment could not be processed.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Payment form fields */}
      <Button type="submit" disabled={processing} className="w-full">
        {processing ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </form>
  );
};
```

## Next Steps for Implementation

1. **Create base payment types** in `src/types/payment.types.ts`
2. **Set up Stripe API wrapper** in `src/lib/stripe-api.ts`
3. **Create payment hooks** following the `useAuth` pattern
4. **Build payment components** following the established Card/Form patterns
5. **Add payment routes** to the existing router structure
6. **Implement consistent error handling** and loading states
7. **Add payment-specific toast messages** following existing patterns

This documentation ensures that all new payment components will seamlessly integrate with the existing frontend architecture while maintaining consistency in design, functionality, and user experience.
