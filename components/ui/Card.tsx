import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({ className, interactive, ...props }: Props) {
  const classes = [
    "rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 shadow-sm backdrop-blur",
    interactive ? "transition hover:-translate-y-0.5 hover:shadow-xl" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["flex flex-col gap-1", className].filter(Boolean).join(" ")} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={["text-base font-semibold text-zinc-100", className].filter(Boolean).join(" ")} {...props} />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={["text-sm text-zinc-400", className].filter(Boolean).join(" ")} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["mt-4", className].filter(Boolean).join(" ")} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["mt-4 flex items-center gap-2", className].filter(Boolean).join(" ")} {...props} />;
}

export default Card;
