import type { AuthOptions } from "next-auth";
import axios from "axios";
import { providers } from "./providers";

export const options: AuthOptions = {
  providers,
  callbacks: {
    // @ts-ignore: Unreachable code error
    async jwt({ token, account }) {
      if (account) {
        // primer login
        return {
          ...token,
          id_token: account.id_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
          provider: account.provider,
        };
      } else if (Date.now() < token.expires_at * 1000) {
        // logins subsecuentes en los que el token no ha expirado
        return token;
      } else {
        // logins subsecuentes donde el token esta expirado
        token.error = undefined;
        if (token.provider === "credentials" || token.provider === "github") {
          return token;
        }
        try {
          if (!token.refresh_token)
            throw new TypeError("Missing refresh_token");
          // el endpoint para refrescar el token se encuentra en la documentacion
          // especifica de cada proveedor. en este caso auth0:
          // https://auth0.com/docs/secure/tokens/refresh-tokens/use-refresh-tokens#use-post-authentication
          const response = await axios.request({
            method: "POST",
            url: `${process.env.AUTH0_ISSUER}/oauth/token`,
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: {
              grant_type: "refresh_token",
              client_id: process.env.AUTH0_CLIENT_ID,
              client_secret: process.env.AUTH0_CLIENT_SECRET,
              refresh_token: token.refresh_token,
            },
          });

          const tokensOrError = await response.data;

          const newTokens = tokensOrError as {
            id_token: string;
            access_token: string;
            expires_in: number;
            refresh_token?: string;
          };

          token.access_token = newTokens.access_token;
          token.expires_at = Math.floor(
            Date.now() / 1000 + newTokens.expires_in,
          );
          token.id_token = newTokens.id_token;
          // solo reasignamos el refresh_token si el provedro solo hace uso unico del mismo
          if (newTokens.refresh_token)
            token.refresh_token = newTokens.refresh_token;
          return token;
        } catch (error) {
          console.error("Error refreshing accessToken", error);
          // retornamos el error para que sea la pagina la que decida que hacer
          token.error = "RefreshTokenError";
          return token;
        }
      }
    },
    async session({ session, token }) {
      if (token) {
        session.id_token = token.id_token ?? "";
        session.user.name = token?.name ?? "";
        session.user.image = token?.picture ?? "";
        session.user.email = token?.email ?? "";
        session.access_token = token.access_token;
        session.error = token.error;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: "/auth/signout",
    // error: "/auth/error", // Error code passed in query string as ?error=
    // verifyRequest: "/auth/verify-request", // (used for check email message)
    // newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      name: string;
      email: string;
      image: string;
    };
    access_token: string;
    id_token: string;
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_token: string;
    access_token: string;
    expires_at: number;
    refresh_token?: string;
    provider: string;
    error?: "RefreshTokenError";
  }
}
