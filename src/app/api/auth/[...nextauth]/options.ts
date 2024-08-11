import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";

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
          password: "palabraSecreta",
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
  ],
  // pages: {
  //   signIn: "/auth/signin",
  //   signOut: "/auth/signout",
  //   error: "/auth/error",
  //   verifyRequest: "/auth/verify-request",
  //   newUser: "/auth/new-user",
  // },
};
