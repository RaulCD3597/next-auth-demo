import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import UserInfo from "@/components/UserInfo";

export default async function Home() {
  const session = await getServerSession(options);
  return session ? (
    <UserInfo user={session.user} pagetype="Home" />
  ) : (
    <h1 className="text-5xl">Informacion de usuario no disponible!</h1>
  );
}
