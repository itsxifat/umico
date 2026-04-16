import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Brand from '@/lib/models/Brand';
import Category from '@/lib/models/Category';
import ShopClient from '../../shop/ShopClient';

export async function generateMetadata({ params }) {
  await dbConnect();
  const brand = await Brand.findOne({ slug: params.slug, status: 'active' }).select('name seoTitle seoDescription').lean();
  if (!brand) return { title: 'Brand Not Found — UMICO' };
  return {
    title: `${brand.seoTitle || brand.name} — UMICO`,
    description: brand.seoDescription || `Shop ${brand.name} products at UMICO.`,
  };
}

export default async function BrandPage({ params, searchParams }) {
  await dbConnect();
  const brand = await Brand.findOne({ slug: params.slug, status: 'active' }).lean();
  if (!brand) notFound();

  const [categories, brands] = await Promise.all([
    Category.find({ status: 'active' }).select('name slug').sort({ sortOrder: 1 }).lean(),
    Brand.find({ status: 'active' }).select('name slug').sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w)] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-muted mb-6 tracking-wide">
        <Link href="/shop" className="hover:text-ink transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-muted-fg">{brand.name}</span>
      </nav>
      <div className="mb-8 flex items-center gap-5">
        {brand.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logo} alt={brand.name} className="h-14 w-auto object-contain border border-line p-2 bg-surface" />
        )}
        <div>
          <p className="text-xs tracking-widest uppercase text-accent mb-2">Brand</p>
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)]">{brand.name}</h1>
        </div>
      </div>
      {brand.description && <p className="text-muted mb-8 max-w-[60ch] text-sm">{brand.description}</p>}
      <Suspense fallback={<div className="text-center py-16 text-muted">Loading…</div>}>
        <ShopClient
          categories={JSON.parse(JSON.stringify(categories))}
          brands={JSON.parse(JSON.stringify(brands))}
          initialParams={{ ...searchParams, brand: params.slug }}
        />
      </Suspense>
    </div>
  );
}
