import * as React from "react";

type Variant = "info" | "success" | "danger";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
};

const variantStyles: Record<Variant, string> = {
  info: "border-blue-500/30 bg-blue-500/10 text-blue-100",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  danger: "border-red-500/30 bg-red-500/10 text-red-100",
};

export default function Toast({ className, variant = "info", ...props }: Props) {
  const classes = [
    "rounded-xl border px-3 py-2 text-sm",
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}
