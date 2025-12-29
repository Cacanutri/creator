import * as React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<Variant, string> = {
  primary: "bg-zinc-50 text-zinc-900 hover:bg-white",
  secondary: "border border-zinc-700 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-900",
  ghost: "border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60",
  danger: "border border-red-400/40 bg-red-500/20 text-red-100 hover:bg-red-500/30",
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
