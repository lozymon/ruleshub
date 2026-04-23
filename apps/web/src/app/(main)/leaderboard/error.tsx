'use client';

import { Button } from '@/components/ui/button';

export default function LeaderboardError({ reset }: { reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-lg font-semibold mb-2">Failed to load leaderboard</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
