import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

export default function VitrineLoading() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6">
          <Card>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-3 h-4 w-80" />
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx}>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="mt-2 h-3 w-1/3" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-16 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
