"use client";

/*
 * Hay que tener en cuenta que para usar la session en un componente
 * cliente, este debe ser un nodo hijo el proveedor de session de next-auth.
 */

import UserInfo from "@/components/UserInfo";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ClientPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/client");
    },
  });

  return (
    <section className="flex flex-col gap-6">
      <UserInfo user={session?.user} pagetype="Client" />
    </section>
  );
}
