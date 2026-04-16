import Link from 'next/link';

export default function AnnouncementBar({ config }) {
  if (!config?.enabled || !config?.text) return null;

  const barCls = 'bg-secondary text-canvas text-center py-2 px-4 text-xs tracking-widest uppercase';
  const content = <span>{config.text}</span>;

  return (
    <div className={barCls}>
      {config.link ? (
        <Link href={config.link} className="text-inherit no-underline">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
