import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function Separator({ className, ...props }: Props) {
  const classes = ["h-px w-full bg-slate-200", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}
