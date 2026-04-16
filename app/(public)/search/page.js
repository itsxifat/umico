import SearchClient from './SearchClient';

export const metadata = { title: 'Search — UMICO' };

export default function SearchPage() {
  return (
    <div className="px-[var(--gutter)] py-10 min-h-[60vh]">
      <SearchClient />
    </div>
  );
}
