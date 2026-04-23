export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 py-6">
        <div className="mx-auto flex max-w-[1240px] items-center">
          <span className="flex items-center gap-2 font-mono text-[15px] font-semibold tracking-tight">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-primary text-[13px] font-bold text-primary-foreground">
              R
            </span>
            ruleshub
          </span>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
