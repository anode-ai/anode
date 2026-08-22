"use client"

import { useState, type ComponentProps, type ReactNode } from "react"
import { useFormStatus } from "react-dom"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { signInWithGoogle } from "@/app/(auth)/actions"

const INPUT_CLASS =
  "w-full border border-border/60 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-accent focus:outline-none disabled:opacity-50"

const LABEL_CLASS = "font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="w-full max-w-md">
      <div className="border border-border/60 bg-card px-6 py-8 sm:px-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{eyebrow}</span>
        <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-4xl leading-none tracking-wide text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
      {footer && (
        <div className="border border-t-0 border-border/60 bg-card/40 px-6 py-4 text-center sm:px-8">{footer}</div>
      )}
    </div>
  )
}

export function AuthField({
  label,
  id,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; id: string; hint?: ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL_CLASS}>
          {label}
        </label>
        {hint}
      </div>
      <input id={id} className={cn(INPUT_CLASS, "mt-2")} {...props} />
    </div>
  )
}

export function PasswordField({
  label,
  id,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; id: string; hint?: ReactNode }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={LABEL_CLASS}>
          {label}
        </label>
        {hint}
      </div>
      <div className="relative mt-2">
        <input id={id} type={visible ? "text" : "password"} className={cn(INPUT_CLASS, "pr-12")} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export function AuthSubmit({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  )
}

export function AuthNotice({ error, message }: { error?: string; message?: string }) {
  const text = error ?? message
  if (!text) return null

  return (
    <p
      role="status"
      aria-live="polite"
      className={cn(
        "border-l-2 bg-background/60 px-3 py-2.5 text-xs leading-relaxed",
        error ? "border-destructive text-destructive" : "border-accent text-foreground",
      )}
    >
      {text}
    </p>
  )
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-border/60" />
      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60">or</span>
      <span className="h-px flex-1 bg-border/60" />
    </div>
  )
}

export function GoogleButton({ next, label }: { next?: string; label: string }) {
  return (
    <form action={signInWithGoogle}>
      {next && <input type="hidden" name="next" value={next} />}
      <GoogleSubmit label={label} />
    </form>
  )
}

function GoogleSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-3 border border-border/60 bg-background px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground transition-colors hover:border-foreground/40 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
      {label}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51Z"
      />
    </svg>
  )
}
