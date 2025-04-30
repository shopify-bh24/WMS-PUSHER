// types/next-auth.d.ts
import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";

declare module "next-auth" {
  // Extend User to include id, role, and token
  interface User {
    id: string;
    username: string;
    role: string;
    token: string;
  }

  // Extend Session to include the custom user properties
  interface Session extends DefaultSession {
    user: User & {
      id: string;
      role: string;
      accessToken: string;
      name: string;  // Add this line if not present
    };
  }

  // Optionally, extend JWT if you want to add custom properties there as well
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
  }
}
