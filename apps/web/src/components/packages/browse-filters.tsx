'use client'; // needs interactivity for filter changes

import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TOOL_LABELS, type PackageSearchParams } from '@ruleshub/types';
import { routes } from '@/lib/routes';

const ASSET_TYPES = ['rule', 'command', 'workflow', 'agent', 'mcp-server', 'pack'] as const;

interface BrowseFiltersProps {
  current: PackageSearchParams;
}

function toSelectValue(value: string | null | undefined): string {
  return value == null ? 'all' : value;
}

export function BrowseFilters({ current }: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function update(key: string, value: string | null | undefined) {
    const params = new URLSearchParams(
      Object.entries(current)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)]),
    );
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Search</label>
        <Input
          placeholder="Search assets…"
          defaultValue={current.q}
          onBlur={(e) => update('q', e.target.value || undefined)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value || undefined);
          }}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Type</label>
        <Select value={toSelectValue(current.type)} onValueChange={(v) => update('type', v === 'all' ? undefined : v)}>
          <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {ASSET_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Tool</label>
        <Select value={toSelectValue(current.tool)} onValueChange={(v) => update('tool', v === 'all' ? undefined : v)}>
          <SelectTrigger><SelectValue placeholder="All tools" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tools</SelectItem>
            {Object.entries(TOOL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
