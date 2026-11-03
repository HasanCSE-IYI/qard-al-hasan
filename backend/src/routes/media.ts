import { Hono } from 'hono';
import { Bindings } from '../db';
import { authMiddleware, AuthUser } from '../middleware/auth';

export const mediaRouter = new Hono<{ Bindings: Bindings; Variables: { user: AuthUser } }>();

// রসিদ বা ডকুমেন্ট আপলোড (Cloudflare R2)
mediaRouter.post('/upload', authMiddleware, async (c) => {
  const user = c.get('user');
  const contentType = c.req.header('Content-Type') || 'image/webp';
  const fileExtension = contentType.includes('png') ? 'png' : contentType.includes('jpeg') ? 'jpg' : 'webp';

  const key = `receipts/${user.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${fileExtension}`;
  const body = await c.req.arrayBuffer();

  if (body.byteLength === 0) {
    return c.json({ success: false, error: 'ফাইল পাওয়া যায়নি' }, 400);
  }

  // সর্বোচ্চ ৩ এমবি সাইজ লিমিট
  if (body.byteLength > 3 * 1024 * 1024) {
    return c.json({ success: false, error: 'ফাইলের আকার সর্বোচ্চ ৩ মেগাবাইট অনুমোদিত' }, 400);
  }

  // Cloudflare R2-তে সেভ
  await c.env.MEDIA_BUCKET.put(key, body, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
  });

  const url = `/api/v1/media/${key}`;
  return c.json({
    success: true,
    data: {
      key,
      url,
      sizeBytes: body.byteLength,
    },
  });
});

// ফাইল ভিউ ও স্ট্রিমিং
mediaRouter.get('/:key{.*}', async (c) => {
  const key = c.req.param('key');
  const object = await c.env.MEDIA_BUCKET.get(key);

  if (!object) {
    return c.json({ success: false, error: 'ফাইল পাওয়া যায়নি' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000');

  return new Response(object.body, { headers });
});
