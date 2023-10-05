import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface User extends DefaultUser {
    id: string;
    role: string;
    access_token: string;
    token_exp: number;
    error?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      access_token: string;
      token_exp: number;
      error?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    user: {
      id: string;
      role: string;
      access_token: string;
      token_exp: number;
      error?: string;
    } & DefaultJWT["user"];
  }
}
