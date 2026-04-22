export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-[1240px] items-center px-6">
          <span className="flex items-center gap-2 font-mono text-[15px] font-semibold tracking-tight">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[5px] bg-primary text-[13px] font-bold text-primary-foreground">
              R
            </span>
            ruleshub
          </span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
