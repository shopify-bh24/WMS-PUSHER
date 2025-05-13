import { Session } from "next-auth";
import config from "@/config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      accessToken: string;
      name: string;
    };
  }
}

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          console.error("Missing credentials");
          throw new Error("Missing username or password");
        }

        try {
          console.log(`Attempting login for user: ${credentials.username}`);
          
          const response = await axios.post(`${process.env.BACKEND_URL}/api/auth/login`, {
            username: credentials.username,
            password: credentials.password
          });

          if (response.data && response.data.token) {
            console.log("Login successful");
            // Return user object that will be saved in the JWT
            return {
              id: response.data.user.id,
              name: response.data.user.username,
              username: response.data.user.username,
              role: response.data.user.role,
              token: response.data.token
            };
          }
          
          console.error("Invalid response format from API:", response.data);
          throw new Error("Invalid response from authentication server");
        } catch (error: any) {
          console.error("Login error:", error.response?.data || error.message);
          // Throw specific error message that came from the backend if available
          throw new Error(error.response?.data?.message || "Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add auth token and user info to the token right after signin
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', // Add error page redirection
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };