type Props = {
  steps: string[];
};

export default function Steps({ steps }: Props) {
  return (
    <ol className="grid gap-2 text-sm text-zinc-300">
      {steps.map((step, idx) => (
        <li key={step} className="flex items-start gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 text-xs text-zinc-200">
            {idx + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}
