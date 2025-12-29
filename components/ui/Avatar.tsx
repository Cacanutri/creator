import * as React from "react";

type Props = {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeStyles: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export default function Avatar({ name, src, size = "md", className }: Props) {
  const initials = (name || "CR")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const classes = [
    "inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 font-semibold text-zinc-200",
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return <img src={src} alt={name ?? "Avatar"} className={classes} />;
  }

  return <div className={classes}>{initials}</div>;
}
