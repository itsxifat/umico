import { Suspense } from 'react';
import ShopClient from './ShopClient';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import Brand from '@/lib/models/Brand';

export const metadata = { title: 'Shop — UMICO' };

async function getFilterOptions() {
  try {
    await dbConnect();
    const [categories, brands] = await Promise.all([
      Category.find({ status: 'active' }).select('name slug').sort({ sortOrder: 1, name: 1 }).lean(),
      Brand.find({ status: 'active' }).select('name slug').sort({ name: 1 }).lean(),
    ]);
    return {
      categories: JSON.parse(JSON.stringify(categories)),
      brands: JSON.parse(JSON.stringify(brands)),
    };
  } catch {
    return { categories: [], brands: [] };
  }
}

export default async function ShopPage({ searchParams }) {
  const { categories, brands } = await getFilterOptions();

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w)] mx-auto">
      <div className="mb-8">
        <p className="text-xs tracking-widest uppercase text-accent mb-2">Collection</p>
        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)]">All Products</h1>
      </div>
      <Suspense fallback={
        <div className="text-center py-16 text-muted">Loading products…</div>
      }>
        <ShopClient
          categories={categories}
          brands={brands}
          initialParams={searchParams}
        />
      </Suspense>
    </div>
  );
}
