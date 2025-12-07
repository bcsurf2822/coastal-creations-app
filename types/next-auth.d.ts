import "next-auth";

declare module "next-auth" {
  /**
   * Extend the built-in User type with custom fields
   */
  interface User {
    isAdmin?: boolean;
  }

  /**
   * Extend the built-in Session type
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT type
   */
  interface JWT {
    isAdmin?: boolean;
  }
}
