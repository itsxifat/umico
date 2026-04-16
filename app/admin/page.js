export const metadata = {
  title: 'Dashboard — UMICO Admin',
};

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-12">
        <p className="text-xs tracking-widest uppercase text-accent mb-3">Dashboard</p>
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-serif mb-3">Overview</h1>
        <p className="text-muted max-w-[60ch]">
          Stats and widgets will populate here once products, orders, and
          customers exist in the database.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {['Orders today', 'Revenue this month', 'New customers', 'Low-stock items'].map((label) => (
          <div key={label} className="bg-surface border border-line p-6 flex flex-col gap-3 min-h-[140px]">
            <div className="text-xs tracking-widest uppercase text-muted">{label}</div>
            <div className="font-serif text-3xl text-ink mt-auto">—</div>
          </div>
        ))}
      </div>
    </div>
  );
}
