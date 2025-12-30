import * as React from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, children, ...props }: Props) {
  const classes = [
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
    "focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/30",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <select className={classes} {...props}>
      {children}
    </select>
  );
}
