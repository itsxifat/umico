import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requireUser } from '@/lib/auth/session';
import { ok, fail, handler } from '@/lib/apiResponse';
import { serialize } from '@/lib/queryHelpers';

// GET — return user's wishlist product IDs
export const GET = handler(async () => {
  const user = await requireUser();
  await dbConnect();

  const doc = await User.findById(user._id)
    .select('wishlist')
    .populate('wishlist', 'name slug price compareAtPrice mainImages status')
    .lean();

  return ok(serialize(doc?.wishlist || []));
});

// POST — add product to wishlist
export const POST = handler(async (req) => {
  const user = await requireUser();
  await dbConnect();

  const { productId } = await req.json();
  if (!productId) return fail('Product ID is required.', { status: 400 });

  await User.findByIdAndUpdate(user._id, {
    $addToSet: { wishlist: productId },
  });

  return ok({ added: true });
});

// DELETE — remove product from wishlist
export const DELETE = handler(async (req) => {
  const user = await requireUser();
  await dbConnect();

  const { productId } = await req.json();
  if (!productId) return fail('Product ID is required.', { status: 400 });

  await User.findByIdAndUpdate(user._id, {
    $pull: { wishlist: productId },
  });

  return ok({ removed: true });
});
