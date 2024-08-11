import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import UserInfo from "@/components/UserInfo";
import { signIn } from "next-auth/react";

export default async function ServerPage() {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/server");
  }

  if (session?.error === "RefreshTokenError") {
    await signIn("auth0"); // Force sign in to obtain a new set of access and refresh tokens
  }

  return (
    <section className="flex flex-col gap-6">
      <UserInfo user={session.user} pagetype="Server" />
    </section>
  );
}
