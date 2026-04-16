import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requireUser } from '@/lib/auth/session';
import { ok, fail, handler } from '@/lib/apiResponse';

export const POST = handler(async (req) => {
  const session = await requireUser();
  const body = await req.json();
  await dbConnect();

  const user = await User.findById(session._id);
  if (!user) return fail('User not found.', { status: 404 });

  const address = {
    label: body.label || '',
    fullName: body.fullName,
    phone: body.phone || '',
    addressLine1: body.addressLine1,
    addressLine2: body.addressLine2 || '',
    city: body.city,
    area: body.area || '',
    postalCode: body.postalCode || '',
    isDefault: body.isDefault || false,
  };

  if (!address.fullName || !address.addressLine1 || !address.city) {
    return fail('Name, address, and city are required.', { status: 400 });
  }

  if (address.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }

  user.addresses.push(address);
  await user.save();

  return ok({ addresses: user.addresses });
});

export const DELETE = handler(async (req) => {
  const session = await requireUser();
  const { index } = await req.json();
  await dbConnect();

  const user = await User.findById(session._id);
  if (!user) return fail('User not found.', { status: 404 });

  if (index < 0 || index >= user.addresses.length) {
    return fail('Invalid address index.', { status: 400 });
  }

  user.addresses.splice(index, 1);
  await user.save();

  return ok({ addresses: user.addresses });
});
