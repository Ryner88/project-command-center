import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
export default function LoginPage() {
  return <main className="login-shell"><Suspense fallback={<p>Loading sign in…</p>}><LoginForm/></Suspense></main>;
}
