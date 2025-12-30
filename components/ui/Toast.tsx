import * as React from "react";

type Variant = "info" | "success" | "danger";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
};

const variantStyles: Record<Variant, string> = {
  info: "border-cyan-200 bg-cyan-50 text-cyan-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  danger: "border-red-200 bg-red-50 text-red-700",
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
