'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarButtonProps {
  initialStars: number;
}

export function StarButton({ initialStars }: StarButtonProps) {
  const [starred, setStarred] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [count, setCount] = useState(initialStars);

  function toggle() {
    if (!starred) {
      setBursting(true);
      setTimeout(() => setBursting(false), 500);
    }
    setStarred((s) => !s);
    setCount((c) => (starred ? c - 1 : c + 1));
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex h-8 items-center gap-1.5 overflow-hidden rounded-md border px-3 font-mono text-[13px] transition-colors ${
        starred
          ? 'border-star text-star'
          : 'border-border-strong bg-bg-elev text-foreground hover:border-border-hover'
      }`}
    >
      <Star
        className={`h-3.5 w-3.5 transition-transform ${
          bursting ? 'star-bursting' : ''
        } ${starred ? 'fill-star' : ''}`}
      />
      <span>{count.toLocaleString()}</span>
    </button>
  );
}
