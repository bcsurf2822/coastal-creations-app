import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
    async signIn({ user }) {
      const allowedEmails = [
        "crystaledgedev22@gmail.com",
        "ashley@coastalcreationsstudio.com",
      ];

      if (user.email && allowedEmails.includes(user.email)) {
        const client = await clientPromise;
        const db = client.db();

        await db.collection("users").updateOne(
          { email: user.email },
          { $set: { isAdmin: true } },
          { upsert: false }
        );

        return true;
      }

      return false;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isAdmin = user.isAdmin || false;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
