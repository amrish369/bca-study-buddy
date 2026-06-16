export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <section className="bg-hero-gradient border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {eyebrow && (
          <span className="text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</span>
        )}
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  );
}
