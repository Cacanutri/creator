import * as React from "react";

type Variant =
  | "default"
  | "platform"
  | "niche"
  | "status"
  | "success"
  | "danger"
  | "muted"
  | "verified";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variantStyles: Record<Variant, string> = {
  default: "border-zinc-700/80 bg-zinc-900/40 text-zinc-200",
  platform: "border-blue-500/40 bg-blue-500/10 text-blue-200",
  niche: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  status: "border-zinc-600/60 bg-zinc-800/60 text-zinc-200",
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  danger: "border-red-400/40 bg-red-500/10 text-red-200",
  muted: "border-zinc-700/60 bg-zinc-800/40 text-zinc-400",
  verified: "border-sky-400/40 bg-sky-500/10 text-sky-200",
};

export default function Badge({ className, variant = "default", ...props }: Props) {
  const classes = [
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} {...props} />;
}
