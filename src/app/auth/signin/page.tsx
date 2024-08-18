"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

interface Props {
  searchParams?: {
    callbackUrl?: string;
  };
}

export default function SigninPage({
  searchParams: { callbackUrl } = { callbackUrl: "/" },
}: Props) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("auth0", { callbackUrl });
    }
  }, [status, callbackUrl]);

  return <></>;
}
