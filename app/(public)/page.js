import dbConnect from '@/lib/db';
import HomeSection from '@/lib/models/HomeSection';
import styles from './page.module.css';

async function getHomeSections() {
  try {
    await dbConnect();
    const sections = await HomeSection.find({ enabled: true })
      .sort({ sortOrder: 1 })
      .lean();
    return JSON.parse(JSON.stringify(sections));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const sections = await getHomeSections();

  if (sections.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyEyebrow}>Coming soon</p>
        <h1 className={styles.emptyTitle}>Home page sections not configured yet.</h1>
        <p className={styles.emptyBody}>
          Sign in to the admin panel and build your home page.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {sections.map((section) => (
        <section key={section._id} className={styles.section}>
          {section.title && <h2 className={styles.sectionTitle}>{section.title}</h2>}
          {section.subtitle && (
            <p className={styles.sectionSubtitle}>{section.subtitle}</p>
          )}
        </section>
      ))}
    </div>
  );
}
