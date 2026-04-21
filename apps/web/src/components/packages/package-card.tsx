import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { routes } from '@/lib/routes';
import { TOOL_LABELS, type PackageDto } from '@ruleshub/types';

interface PackageCardProps {
  pkg: PackageDto;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const [namespace, name] = pkg.fullName.split('/');

  return (
    <Link href={routes.package(pkg.fullName)}>
      <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-sm font-semibold truncate">{pkg.fullName}</span>
            <Badge variant="outline" className="shrink-0 text-xs">
              {pkg.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
          <div className="flex flex-wrap gap-1">
            {pkg.supportedTools.slice(0, 3).map((tool) => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {TOOL_LABELS[tool] ?? tool}
              </Badge>
            ))}
            {pkg.supportedTools.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{pkg.supportedTools.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>↓ {pkg.totalDownloads.toLocaleString()}</span>
            <span>★ {pkg.stars}</span>
            {pkg.latestVersion && <span className="font-mono">{pkg.latestVersion.version}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
