import { notFound } from 'next/navigation';
import { getPackage } from '@/lib/api/packages';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TOOL_LABELS } from '@ruleshub/types';

interface PackagePageProps {
  params: Promise<{ namespace: string; name: string }>;
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { namespace, name } = await params;

  let pkg;
  try {
    pkg = await getPackage(namespace, name);
  } catch {
    notFound();
  }

  const version = pkg.latestVersion?.version ?? 'no releases';

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold font-mono">
              {namespace}/{name}
            </h1>
            <Badge variant="outline">{version}</Badge>
            <Badge>{pkg.type}</Badge>
          </div>
          <p className="text-muted-foreground">{pkg.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {pkg.supportedTools.map((tool) => (
              <Badge key={tool} variant="secondary">
                {TOOL_LABELS[tool] ?? tool}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm text-muted-foreground">
            {pkg.totalDownloads.toLocaleString()} downloads
          </p>
          <p className="text-sm text-muted-foreground">{pkg.stars} stars</p>
        </div>
      </div>

      <Separator className="mb-6" />

      <Tabs defaultValue="readme">
        <TabsList>
          <TabsTrigger value="readme">README</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="install">Install</TabsTrigger>
        </TabsList>

        <TabsContent value="readme" className="mt-4 prose prose-invert max-w-none">
          <p className="text-muted-foreground italic">No README provided.</p>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          {pkg.latestVersion ? (
            <div className="flex items-center gap-3 py-2 px-4 rounded border text-sm font-mono">
              <span>{pkg.latestVersion.version}</span>
              <span className="text-muted-foreground">
                {new Date(pkg.latestVersion.publishedAt).toLocaleDateString()}
              </span>
              <span className="text-muted-foreground">
                {pkg.latestVersion.downloads} downloads
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground">No versions published yet.</p>
          )}
        </TabsContent>

        <TabsContent value="install" className="mt-4 space-y-4">
          {pkg.supportedTools.map((tool) => (
            <div key={tool}>
              <p className="text-sm font-medium mb-1">{TOOL_LABELS[tool] ?? tool}</p>
              <pre className="bg-muted rounded p-3 text-sm font-mono overflow-x-auto">
                npx ruleshub install {namespace}/{name} --tool {tool}
              </pre>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
