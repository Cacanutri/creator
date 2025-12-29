import * as React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className, ...props }: Props) {
  const classes = [
    "w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500",
    "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <textarea className={classes} {...props} />;
}
