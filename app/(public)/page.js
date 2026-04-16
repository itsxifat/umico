import dbConnect from '@/lib/db';
import HomeSection from '@/lib/models/HomeSection';

async function getHomeSections() {
  try {
    await dbConnect();
    const sections = await HomeSection.find({ enabled: true }).sort({ sortOrder: 1 }).lean();
    return JSON.parse(JSON.stringify(sections));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const sections = await getHomeSections();

  if (sections.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-[var(--gutter)] py-16 max-w-[var(--max-w-text)] mx-auto">
        <p className="text-xs tracking-widest uppercase text-accent mb-4">Coming soon</p>
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-serif leading-tight max-w-[14ch] mb-5">
          Home page sections not configured yet.
        </h1>
        <p className="text-muted max-w-[40ch]">
          Sign in to the admin panel and build your home page.
        </p>
      </div>
    );
  }

  return (
    <div className="px-[var(--gutter)] py-12 max-w-[var(--max-w)] mx-auto">
      {sections.map((section) => (
        <section key={section._id} className="py-16 border-b border-line last:border-b-0">
          {section.title && (
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-serif mb-3">{section.title}</h2>
          )}
          {section.subtitle && (
            <p className="text-muted max-w-[var(--max-w-text)]">{section.subtitle}</p>
          )}
        </section>
      ))}
    </div>
  );
}
