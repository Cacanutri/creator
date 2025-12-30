import * as React from "react";
import Image from "next/image";

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

  const wrapperClass = [
    "relative inline-flex items-center justify-center overflow-hidden rounded-full border border-slate-200 font-semibold text-slate-700",
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return (
      <div className={wrapperClass}>
        <Image src={src} alt={name ?? "Avatar"} fill sizes="48px" className="object-cover" />
      </div>
    );
  }

  return (
    <div className={`${wrapperClass} bg-gradient-to-br from-cyan-100 via-white to-pink-100`}>
      {initials}
    </div>
  );
}
