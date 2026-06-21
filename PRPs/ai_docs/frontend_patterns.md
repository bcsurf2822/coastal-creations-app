# Frontend Patterns

## React Component Structure

### Protected Route Pattern
```tsx
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
```

### Dark Theme Enforcement
```tsx
const DarkThemeEnforcer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return <>{children}</>;
};
```

## Authentication Patterns

### Auth Hook Structure
```tsx
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, signIn, signOut };
};
```

### OAuth Callback Handler
```tsx
export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        navigate('/login?error=' + encodeURIComponent(error.message));
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing authentication...</div>;
};
```

## SSE Streaming Pattern

### Chat Message Streaming
```tsx
const streamChat = async (messages: Message[], conversationId: string) => {
  const response = await fetch(import.meta.env.VITE_AGENT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`
    },
    body: JSON.stringify({
      messages,
      conversation_id: conversationId,
      stream: true
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);

        if (data === '[DONE]') {
          return;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.text) {
            setCurrentMessage(prev => prev + parsed.text);
          }
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  }
};
```

## Supabase Integration

### Real-time Subscriptions
```tsx
useEffect(() => {
  const channel = supabase
    .channel('conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${user?.id}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setConversations(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setConversations(prev =>
            prev.map(c => c.id === payload.new.id ? payload.new : c)
          );
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user?.id]);
```

### Database Queries
```tsx
const fetchConversations = async () => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    toast.error('Failed to load conversations');
    return [];
  }

  return data;
};
```

## State Management

### Conversation State
```tsx
interface ChatState {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
}

const useChatState = () => {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversation: null,
    messages: [],
    isStreaming: false,
    error: null
  });

  const updateState = (updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return { state, updateState };
};
```

## Shadcn UI Patterns

### Dialog with Form
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button variant="outline">Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

### Toast Notifications
```tsx
const { toast } = useToast();

// Success toast
toast({
  title: "Success",
  description: "Your changes have been saved.",
});

// Error toast
toast({
  variant: "destructive",
  title: "Error",
  description: "Something went wrong. Please try again.",
});
```

## TypeScript Patterns

### Type Definitions
```tsx
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  message_count: number;
}

type Database = {
  public: {
    Tables: {
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Conversation, 'id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'timestamp'>;
        Update: Partial<Omit<Message, 'id'>>;
      };
    };
  };
};
```

## Error Handling

### API Error Handler
```tsx
const handleAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
};

// Usage in try-catch
try {
  const result = await apiCall();
} catch (error) {
  toast({
    variant: "destructive",
    title: "Error",
    description: handleAPIError(error),
  });
}
```

## Performance Patterns

### Debounced Search
```tsx
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const searchTerm = useDebounce(inputValue, 500);

useEffect(() => {
  if (searchTerm) {
    performSearch(searchTerm);
  }
}, [searchTerm]);
```

### Memo and Callback
```tsx
const MessageList = React.memo(({ messages }: { messages: Message[] }) => {
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const formattedMessages = useMemo(() =>
    messages.map(msg => ({
      ...msg,
      formattedTime: formatTimestamp(msg.timestamp)
    })), [messages]
  );

  return (
    <div className="message-list">
      {formattedMessages.map(msg => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
});
```