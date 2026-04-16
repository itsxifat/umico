export default function AdminPageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
      <div>
        <h1 className="text-[clamp(1.5rem,3vw,2.25rem)] font-serif mb-1">{title}</h1>
        {subtitle && <p className="text-muted text-sm">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
