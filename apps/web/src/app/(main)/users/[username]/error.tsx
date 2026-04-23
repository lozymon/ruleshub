'use client'; // required for error boundaries

import { Button } from '@/components/ui/button';

export default function UserError({ reset }: { reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-lg font-semibold mb-2">Failed to load profile</h2>
      <p className="text-muted-foreground mb-4">Something went wrong fetching this user.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
