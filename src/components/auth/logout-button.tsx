"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="nav-button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.replace("/login" as never);
          router.refresh();
        })
      }
      type="button"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
