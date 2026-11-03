import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { eq } from 'drizzle-orm';
import { Bindings, getDb } from '../db';
import { users, otpSessions } from '../db/schema';
import { RequestOtpSchema, VerifyOtpSchema } from '@qard/shared';
import { authMiddleware, AuthUser } from '../middleware/auth';

export const authRouter = new Hono<{ Bindings: Bindings; Variables: { user: AuthUser } }>();

// ওটিপি রিকোয়েস্ট
authRouter.post('/request-otp', async (c) => {
  const body = await c.req.json();
  const parsed = RequestOtpSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
  }

  const { phone } = parsed.data;
  // ৬ ডিজিটের নিরাপদ ওটিপি
  const otp = c.env.ENVIRONMENT === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // ৫ মিনিট মেয়াদ

  const db = getDb(c.env.DB);
  await db
    .insert(otpSessions)
    .values({ phone, otp, expiresAt })
    .onConflictDoUpdate({
      target: otpSessions.phone,
      set: { otp, expiresAt },
    });

  return c.json({
    success: true,
    message: 'OTP পাঠানো হয়েছে',
    devOtp: c.env.ENVIRONMENT === 'development' ? otp : undefined,
  });
});

// ওটিপি যাচাই ও লগইন/রেজিস্ট্রেশন
authRouter.post('/verify-otp', async (c) => {
  const body = await c.req.json();
  const parsed = VerifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.errors[0].message }, 400);
  }

  const { phone, otp, name } = parsed.data;
  const db = getDb(c.env.DB);

  const session = await db.select().from(otpSessions).where(eq(otpSessions.phone, phone)).get();
  if (!session || session.otp !== otp || session.expiresAt < Date.now()) {
    return c.json({ success: false, error: 'ভুল বা মেয়াদোত্তীর্ণ OTP' }, 400);
  }

  // ইউজারের তথ্য খোঁজা বা তৈরি
  let user = await db.select().from(users).where(eq(users.phone, phone)).get();
  const now = new Date().toISOString();

  if (!user) {
    const newUserId = crypto.randomUUID();
    await db.insert(users).values({
      id: newUserId,
      name: name || `User-${phone.slice(-4)}`,
      phone,
      role: 'INDIVIDUAL',
      husnScore: 100,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    });
    user = await db.select().from(users).where(eq(users.id, newUserId)).get();
  }

  // ওটিপি সেশন পরিষ্কার
  await db.delete(otpSessions).where(eq(otpSessions.phone, phone));

  // JWT টোকেন জেনারেট
  const secret = c.env.JWT_SECRET || 'qard-al-hasan-super-secret-jwt-key-2026';
  const token = await sign(
    {
      id: user!.id,
      phone: user!.phone,
      role: user!.role,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // ৩০ দিন মেয়াদ
    },
    secret,
    'HS256'
  );

  return c.json({
    success: true,
    data: {
      token,
      user,
    },
  });
});

// প্রোফাইল তথ্য
authRouter.get('/me', authMiddleware, async (c) => {
  const authUser = c.get('user');
  const db = getDb(c.env.DB);
  const user = await db.select().from(users).where(eq(users.id, authUser.id)).get();
  if (!user) {
    return c.json({ success: false, error: 'ইউজার পাওয়া যায়নি' }, 404);
  }
  return c.json({ success: true, data: user });
});
