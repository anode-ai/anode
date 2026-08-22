"use client"

import Link from "next/link"
import { useActionState } from "react"
import { login, requestPasswordReset, signUp, updatePassword, type AuthState } from "@/app/(auth)/actions"
import {
  AuthCard,
  AuthDivider,
  AuthField,
  AuthNotice,
  AuthSubmit,
  GoogleButton,
  PasswordField,
} from "@/components/auth/auth-ui"

const EMPTY: AuthState = {}

const FORM_CLASS = "flex flex-col gap-5"
const LINK_CLASS = "font-mono text-[11px] uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-80"
const HINT_CLASS = "font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-accent"

/** An error handed over in the URL only shows until the form itself has something to say. */
function notice(state: AuthState, urlError?: string): AuthState {
  return state.error || state.message ? state : { error: urlError }
}

export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const [state, formAction] = useActionState(login, EMPTY)

  return (
    <AuthCard
      eyebrow="Sign in"
      title="Welcome back"
      description="Pick up where you left off — your assistants, training data, and embeds are waiting."
      footer={
        <span className="text-xs text-muted-foreground">
          No account yet?{" "}
          <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className={LINK_CLASS}>
            Create one
          </Link>
        </span>
      }
    >
      <form action={formAction} className={FORM_CLASS}>
        {next && <input type="hidden" name="next" value={next} />}
        <AuthField
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <PasswordField
          label="Password"
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          hint={
            <Link href="/forgot-password" className={HINT_CLASS}>
              Forgot?
            </Link>
          }
        />
        <AuthNotice {...notice(state, error)} />
        <AuthSubmit>Sign in</AuthSubmit>
      </form>

      <AuthDivider />
      <GoogleButton next={next} label="Continue with Google" />
    </AuthCard>
  )
}

export function SignUpForm({ next, error }: { next?: string; error?: string }) {
  const [state, formAction] = useActionState(signUp, EMPTY)

  return (
    <AuthCard
      eyebrow="Create account"
      title="Start building"
      description="Spin up an AI assistant, train it on your own data, and ship it with a single script tag."
      footer={
        <span className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className={LINK_CLASS}>
            Sign in
          </Link>
        </span>
      }
    >
      <form action={formAction} className={FORM_CLASS}>
        {next && <input type="hidden" name="next" value={next} />}
        <AuthField
          label="Name"
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          maxLength={80}
          required
        />
        <AuthField
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <PasswordField
          label="Password"
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
        <AuthNotice {...notice(state, error)} />
        <AuthSubmit>Create account</AuthSubmit>
      </form>

      <AuthDivider />
      <GoogleButton next={next} label="Sign up with Google" />
    </AuthCard>
  )
}

export function ForgotPasswordForm({ error }: { error?: string }) {
  const [state, formAction] = useActionState(requestPasswordReset, EMPTY)

  return (
    <AuthCard
      eyebrow="Recover"
      title="Reset password"
      description="Enter the email on your account and we'll send a link to set a new password."
      footer={
        <span className="text-xs text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className={LINK_CLASS}>
            Back to sign in
          </Link>
        </span>
      }
    >
      <form action={formAction} className={FORM_CLASS}>
        <AuthField
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
        <AuthNotice {...notice(state, error)} />
        <AuthSubmit>Send reset link</AuthSubmit>
      </form>
    </AuthCard>
  )
}

export function ResetPasswordForm({ error }: { error?: string }) {
  const [state, formAction] = useActionState(updatePassword, EMPTY)

  return (
    <AuthCard
      eyebrow="Recover"
      title="New password"
      description="Choose a new password for your account. You'll be signed straight into your workspace."
    >
      <form action={formAction} className={FORM_CLASS}>
        <PasswordField
          label="New password"
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
        <PasswordField
          label="Confirm password"
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat it back"
          minLength={8}
          required
        />
        <AuthNotice {...notice(state, error)} />
        <AuthSubmit>Update password</AuthSubmit>
      </form>
    </AuthCard>
  )
}
