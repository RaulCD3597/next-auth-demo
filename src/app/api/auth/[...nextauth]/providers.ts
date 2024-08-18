import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import Auth0Provider from "next-auth/providers/auth0";

export const providers = [
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
];
