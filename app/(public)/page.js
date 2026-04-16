import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

async function getFeaturedProducts() {
  try {
    await dbConnect();
    const products = await Product.find({ status: 'active', isFeatured: true })
      .sort({ createdAt: -1 }).limit(8)
      .select('name slug price compareAtPrice mainImages averageRating reviewCount stock')
      .populate('brand', 'name slug')
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch { return []; }
}

async function getNewArrivals() {
  try {
    await dbConnect();
    const products = await Product.find({ status: 'active', isNewArrival: true })
      .sort({ createdAt: -1 }).limit(4)
      .select('name slug price compareAtPrice mainImages averageRating reviewCount stock')
      .populate('brand', 'name slug')
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch { return []; }
}

async function getCategories() {
  try {
    await dbConnect();
    const cats = await Category.find({ status: 'active' })
      .sort({ sortOrder: 1 }).limit(6)
      .select('name slug image')
      .lean();
    return JSON.parse(JSON.stringify(cats));
  } catch { return []; }
}

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col justify-center items-center text-center px-[var(--gutter)] py-20">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Unisex Cosmetics</p>
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-serif leading-[1.1] max-w-[16ch] mb-6">
          Beauty without boundaries
        </h1>
        <p className="text-muted max-w-[40ch] mb-8 text-sm leading-relaxed">
          Curated skincare, haircare, and beauty — for everyone.
          100% authentic, delivered to your doorstep.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/shop"
            className="px-10 py-4 bg-secondary text-canvas text-xs tracking-[0.2em] uppercase hover:opacity-85 transition-opacity">
            Shop now
          </Link>
          <Link href="/about"
            className="px-10 py-4 border border-line-strong text-xs tracking-[0.2em] uppercase text-muted-fg hover:text-ink hover:border-ink transition-colors">
            Our story
          </Link>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-[var(--gutter)] py-16 max-w-[var(--max-w)] mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest uppercase text-accent mb-2">Browse</p>
            <h2 className="font-serif text-[clamp(1.5rem,3vw,2.5rem)]">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat._id} href={`/category/${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-6 border border-line hover:border-line-strong transition-colors text-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-16 h-16 object-cover rounded-full" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-surface-alt border border-line" />
                )}
                <span className="text-xs tracking-wide uppercase text-muted-fg group-hover:text-ink transition-colors font-medium">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="px-[var(--gutter)] py-16 max-w-[var(--max-w)] mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-accent mb-2">Curated</p>
              <h2 className="font-serif text-[clamp(1.5rem,3vw,2.5rem)]">Featured Products</h2>
            </div>
            <Link href="/shop?featured=true" className="text-xs tracking-wide uppercase text-muted-fg hover:text-ink transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="px-[var(--gutter)] py-16 max-w-[var(--max-w)] mx-auto">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-accent mb-2">Just in</p>
              <h2 className="font-serif text-[clamp(1.5rem,3vw,2.5rem)]">New Arrivals</h2>
            </div>
            <Link href="/shop?newArrival=true" className="text-xs tracking-wide uppercase text-muted-fg hover:text-ink transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Trust bar */}
      <section className="px-[var(--gutter)] py-16 border-t border-line">
        <div className="max-w-[var(--max-w)] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { title: 'Authentic', desc: '100% genuine products' },
            { title: 'Fast Delivery', desc: '1–3 business days' },
            { title: 'Free Shipping', desc: 'On orders over ৳999' },
            { title: 'Easy Returns', desc: '7-day return policy' },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-serif text-lg text-ink mb-1">{item.title}</h3>
              <p className="text-xs text-muted tracking-wide">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
