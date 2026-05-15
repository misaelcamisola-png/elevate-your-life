export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-start justify-between px-4 pt-4 pb-2">
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-card p-3 ${className}`}>{children}</div>;
}

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="px-4 pb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
