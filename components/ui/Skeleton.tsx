import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className, ...props }: Props) {
  const classes = ["animate-pulse rounded-lg bg-slate-200/70", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}
