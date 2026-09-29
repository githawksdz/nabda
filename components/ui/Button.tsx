import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button as ShadcnButton } from "@/components/shadcn/button";
import { Spinner } from "@/components/shadcn/spinner";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "link";
type ButtonSize = "md" | "compact";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: string;
  children: ReactNode;
};

const VARIANT = {
  primary: "default",
  secondary: "secondary",
  ghost: "ghost",
  destructive: "destructive",
  link: "link",
} as const;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  href,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = cn(
    "motion-press font-sans text-sm font-semibold",
    variant !== "link" && "h-auto min-h-[var(--size-touch)]",
    size === "compact" &&
      variant !== "link" &&
      "min-h-[var(--size-control-compact)]",
    className,
  );
  const content = (
    <>
      {loading ? <Spinner data-icon="inline-start" /> : null}
      {children}
    </>
  );

  if (href && !isDisabled) {
    return (
      <ShadcnButton
        variant={VARIANT[variant]}
        className={classes}
        asChild
        aria-busy={loading || undefined}
      >
        <Link href={href}>{content}</Link>
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton
      type={type}
      variant={VARIANT[variant]}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </ShadcnButton>
  );
}
