import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';

export const metadata = { title: 'Wishlist — UMICO' };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?from=/account/wishlist');

  await dbConnect();
  const fullUser = await User.findById(user._id).select('wishlist').lean();
  const wishlistIds = fullUser?.wishlist || [];

  let products = [];
  if (wishlistIds.length > 0) {
    products = await Product.find({ _id: { $in: wishlistIds }, status: 'active' })
      .populate('brand', 'name slug')
      .lean();
    products = JSON.parse(JSON.stringify(products));
  }

  return (
    <div className="px-[var(--gutter)] py-10 max-w-[var(--max-w)] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-muted mb-6 tracking-wide">
        <Link href="/account" className="hover:text-ink transition-colors">Account</Link>
        <span>/</span>
        <span className="text-muted-fg">Wishlist</span>
      </nav>
      <h1 className="font-serif text-2xl mb-8">Wishlist</h1>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-xl text-muted mb-4">Your wishlist is empty</p>
          <Link href="/shop" className="inline-block px-8 py-3 bg-secondary text-canvas text-xs tracking-widest uppercase hover:opacity-85 transition-opacity">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 min-[640px]:grid-cols-3 min-[1024px]:grid-cols-4 gap-x-4 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
