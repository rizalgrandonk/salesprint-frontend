import { getUserInfo, loginUser, refreshToken } from "@/lib/api/auth";
import axios from "@/lib/axios";
import NextAuth from "next-auth";
import CredentialsProviders from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProviders({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const result = await loginUser(credentials);

          if (!result.success) {
            return null;
          }

          const data = result.data;

          const current_user = data?.user;
          const token = data?.access_token;
          const exp = data?.expires_in;
          const user = {
            id: current_user.id,
            name: current_user.name,
            email: current_user.email,
            role: current_user.role,
            username: current_user.username,
            phone_number: current_user.phone_number,
            image: current_user.image,
            access_token: token,
            token_exp: Date.now() + exp * 1000,
          };

          return user;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.user = user;
        token.role = user.role;
        token.token_exp = user.token_exp;
        token.access_token = user.access_token;
      }

      const shouldRefreshTime = Math.round(
        token.user.token_exp - 9 * 60 * 1000 - Date.now()
      );

      if (shouldRefreshTime > 0) {
        const data = await getUserInfo(token.user.access_token);
        if (data) {
          const { created_at, updated_at, email_verified_at, ...userData } =
            data;
          token.user = {
            ...token.user,
            ...userData,
          };
          token.role = data.role;
        }
        return Promise.resolve(token);
      }

      // TODO refresh token
      const result = await refreshToken(token.user.access_token);
      if (result.success) {
        token.user.access_token = result.data.access_token;
        token.user.token_exp = Date.now() + result.data.expires_in * 1000;
      } else {
        token.user.error = "error_refresh_token";
      }
      return Promise.resolve(token);
    },
    async session({ session, token, user }) {
      if (token.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  theme: {
    brandColor: "#FF5722",
    buttonText: "Login",
    logo: "/logo.png",
  },
  pages: {
    signIn: "/auth/login",
  },
});
