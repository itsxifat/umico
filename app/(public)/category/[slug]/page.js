import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import Brand from '@/lib/models/Brand';
import ShopClient from '../../shop/ShopClient';

export async function generateMetadata({ params }) {
  await dbConnect();
  const cat = await Category.findOne({ slug: params.slug, status: 'active' }).select('name seoTitle seoDescription').lean();
  if (!cat) return { title: 'Category Not Found — UMICO' };
  return {
    title: `${cat.seoTitle || cat.name} — UMICO`,
    description: cat.seoDescription || `Browse ${cat.name} products at UMICO.`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  await dbConnect();
  const cat = await Category.findOne({ slug: params.slug, status: 'active' }).lean();
  if (!cat) notFound();

  const [categories, brands] = await Promise.all([
    Category.find({ status: 'active' }).select('name slug').sort({ sortOrder: 1 }).lean(),
    Brand.find({ status: 'active' }).select('name slug').sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w)] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-muted mb-6 tracking-wide">
        <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-muted-fg">{cat.name}</span>
      </nav>
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-accent mb-2">Category</p>
        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)]">{cat.name}</h1>
        {cat.description && <p className="text-muted mt-2 max-w-[60ch] text-sm">{cat.description}</p>}
      </div>
      <Suspense fallback={<div className="text-center py-16 text-muted">Loading…</div>}>
        <ShopClient
          categories={JSON.parse(JSON.stringify(categories))}
          brands={JSON.parse(JSON.stringify(brands))}
          initialParams={{ ...searchParams, category: params.slug }}
        />
      </Suspense>
    </div>
  );
}
