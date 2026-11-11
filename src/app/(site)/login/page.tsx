import { LoginForm } from "./login-form";
import { card, section } from "@/components/ui/styles";
import { safeNextPath } from "@/shared/safe-url";

export const metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  "missing-code": "That link was incomplete. Request a new one.",
  "expired-link": "That link expired. Request a new one.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/profile");
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  return (
    <div className={`${section()} max-w-md`}>
      <h1 className="mb-2 text-3xl">Sign in</h1>
      <p className="mb-8 text-sm text-muted">
        No password. We mail you a link that signs you in on this device.
      </p>
      <div className={card()}>
        {error && (
          <p role="alert" className="mb-4 text-sm text-accent">
            {error}
          </p>
        )}
        <LoginForm next={next} />
      </div>
    </div>
  );
}
