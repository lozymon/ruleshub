import { DocsSidebar } from "@/components/docs/docs-sidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl px-4">
      <DocsSidebar />
      <div className="min-w-0 flex-1 border-l border-border py-8 pl-8">
        {children}
      </div>
    </div>
  );
}
