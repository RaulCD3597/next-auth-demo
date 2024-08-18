import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import UserInfo from "@/components/UserInfo";

export default async function ServerPage() {
  const session = await getServerSession(options);

  if (!session || session?.error === "RefreshTokenError") {
    redirect("/auth/signin?callbackUrl=/server");
  }

  return (
    <section className="flex flex-col gap-6">
      <UserInfo user={session.user} pagetype="Server" />
    </section>
  );
}
