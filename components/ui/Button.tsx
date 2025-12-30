import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#FF0033] text-white shadow-sm hover:opacity-90",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: Props) {
  const classes = [baseStyles, variantStyles[variant], sizeStyles[size], className]
    .filter(Boolean)
    .join(" ");
  return <button type={type} className={classes} {...props} />;
}
