import dbConnect from '@/lib/db';
import ContactMessage from '@/lib/models/ContactMessage';
import { ok, fail, handler } from '@/lib/apiResponse';

export const POST = handler(async (req) => {
  const body = await req.json();
  if (!body.name || !body.email || !body.subject || !body.message) {
    return fail('All required fields must be filled.', { status: 400 });
  }

  await dbConnect();
  await ContactMessage.create({
    name: body.name,
    email: body.email,
    phone: body.phone || '',
    subject: body.subject,
    message: body.message,
  });

  return ok({ sent: true }, { status: 201 });
});
