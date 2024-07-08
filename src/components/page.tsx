import { Navigation } from "@/components/navigation";

export default function Page({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Navigation />
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>

        {children}
      </div>
    </div>
  );
}
