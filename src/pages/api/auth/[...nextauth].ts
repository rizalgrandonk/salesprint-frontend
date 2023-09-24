import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProviders from "next-auth/providers/credentials";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default NextAuth({
  providers: [
    CredentialsProviders({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // console.log(credentials);
          const res = await axios.post(
            BASE_URL + "/api/auth/login",
            credentials
          );

          const current_user = res.data?.user;
          const token = res.data?.access_token;

          if (res.status === 200 && current_user && token) {
            const user = {
              id: current_user.id,
              name: current_user.name,
              email: current_user.email,
              role: current_user.role,
              access_token: token,
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
      if (account && user) {
        token.account = {
          ...account,
          access_token: user.access_token,
        };
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (token.role) {
        session.user.role = token.role;
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
