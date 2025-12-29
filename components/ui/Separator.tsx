import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function Separator({ className, ...props }: Props) {
  const classes = ["h-px w-full bg-zinc-800/80", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}
