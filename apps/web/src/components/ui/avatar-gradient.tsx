function gradientFromHandle(handle: string) {
  const hue = [...handle].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return `linear-gradient(135deg, oklch(0.55 0.15 ${hue}), oklch(0.32 0.1 ${(hue + 40) % 360}))`;
}

interface AvatarGradientProps {
  handle: string;
  src?: string | null;
  size?: number;
  className?: string;
}

export function AvatarGradient({
  handle,
  src,
  size = 32,
  className = "",
}: AvatarGradientProps) {
  const initials = handle.slice(0, 2).toUpperCase();

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={handle}
        width={size}
        height={size}
        className={`rounded-full border border-border object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-mono font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: gradientFromHandle(handle),
      }}
    >
      {initials}
    </div>
  );
}
