import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = [
        "crystaledgedev22@gmail.com",
        "ashley@coastalcreationsstudio.com",
      ];
      if (user.email && allowedEmails.includes(user.email)) {
        return true;
      }
      return false;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
