import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { Bindings } from '../db';

export interface AuthUser {
  id: string;
  phone: string;
  role: string;
}

export async function authMiddleware(c: Context<{ Bindings: Bindings; Variables: { user: AuthUser } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'অননুমোদিত প্রবেশাধিকার (Unauthorized)' }, 401);
  }

  const token = authHeader.substring(7);
  const secret = c.env.JWT_SECRET || 'qard-al-hasan-super-secret-jwt-key-2026';

  try {
    const payload = await verify(token, secret, 'HS256');
    c.set('user', {
      id: payload.id as string,
      phone: payload.phone as string,
      role: (payload.role as string) || 'INDIVIDUAL',
    });
    await next();
  } catch (err) {
    return c.json({ success: false, error: 'টোকেন মেয়াদোত্তীর্ণ বা অকার্যকর' }, 401);
  }
}
