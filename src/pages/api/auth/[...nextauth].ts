import { loginUser, refreshToken } from "@/lib/api/auth";
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
          const data = await loginUser(credentials);

          if (data) {
            const current_user = data?.user;
            const token = data?.access_token;
            const exp = data?.expires_in;
            const user = {
              id: current_user.id,
              name: current_user.name,
              email: current_user.email,
              role: current_user.role,
              username: current_user.username,
              image: current_user.image,
              access_token: token,
              token_exp: Date.now() + exp * 1000,
            };

            return user;
          } else {
            return null;
          }
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
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.user = user;
        token.role = user.role;
        token.token_exp = user.token_exp;
        token.access_token = user.access_token;
      }

      const shouldRefreshTime = Math.round(
        token.user.token_exp - 10 * 60 * 1000 - Date.now()
      );

      if (shouldRefreshTime > 0) {
        return Promise.resolve(token);
      }

      // TODO refresh token
      const data = await refreshToken(token.user.access_token);
      const access_token = data?.access_token;
      if (access_token) {
        token.user.access_token = access_token;
        token.user.token_exp = Date.now() + data.expires_in * 1000;
      } else {
        token.user.error = "error_refresh_token";
      }
      return token;
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
