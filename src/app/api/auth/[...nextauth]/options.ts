import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import Auth0Provider from "next-auth/providers/auth0";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const options: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: {
          label: "Username:",
          type: "text",
          placeholder: "your-username",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "your-secret-password",
        },
      },
      async authorize(credentials, _req) {
        /*
         * aqui es donde ponemos cualquier logica que recibe las credenciales como
         * parametros y retorne un objeto con la informacion de autenticacion del usuario.
         * (aqui realizamos pordemos realizar llamadas a endpoints, bases de datos, etc)
         */
        const user = {
          id: "3c13473d-a4f1-4dcc-a192-3d9008964d32",
          name: "Raul",
          password: "secret",
        };
        if (
          credentials?.username === user.name &&
          credentials?.password === user.password
        ) {
          return user;
        } else {
          return null;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID as string,
      clientSecret: process.env.AUTH0_CLIENT_SECRET as string,
      issuer: process.env.AUTH0_ISSUER,
      authorization: {
        // auth0 requires offline_access scope to send a refresh_token
        params: { scope: "openid email profile offline_access" },
      },
    }),
  ],
  callbacks: {
    // @ts-ignore: Unreachable code error
    async jwt({ token, account }) {
      if (account) {
        // primer login
        let exp = 0;
        if (account.id_token) {
          const decoded = jwtDecode(account.id_token);
          exp = decoded.exp ?? 0;
        }
        return {
          ...token,
          id_token: account.id_token,
          access_token: account.access_token,
          expires_at: exp > 0 ? exp : account.expires_at,
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
            refresh_token?: string;
          };

          token.access_token = newTokens.access_token;
          token.expires_at = jwtDecode(newTokens.id_token).exp!;
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
  // pages: {
  //   signIn: "/auth/signin",
  //   signOut: "/auth/signout",
  //   error: "/auth/error",
  //   verifyRequest: "/auth/verify-request",
  //   newUser: "/auth/new-user",
  // },
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
