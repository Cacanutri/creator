import Card from "@/components/ui/Card";

type Props = {
  title: string;
  description: string;
  items?: string[];
};

export default function InfoCallout({ title, description, items }: Props) {
  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
          <InfoIcon />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
          {items && items.length > 0 && (
            <ul className="mt-3 grid gap-1 text-sm text-slate-600">
              {items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}
