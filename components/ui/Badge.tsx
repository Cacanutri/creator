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
  default: "border-slate-200 bg-slate-100 text-slate-700",
  platform: "border-cyan-200 bg-cyan-50 text-cyan-700",
  niche: "border-pink-200 bg-pink-50 text-pink-700",
  status: "border-slate-200 bg-white text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  muted: "border-slate-200 bg-slate-50 text-slate-500",
  verified: "border-sky-200 bg-sky-50 text-sky-700",
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
