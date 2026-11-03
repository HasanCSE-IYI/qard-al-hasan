import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { Bindings } from './db';
import { authRouter } from './routes/auth';
import { loansRouter } from './routes/loans';
import { repaymentsRouter } from './routes/repayments';
import { dashboardRouter } from './routes/dashboard';
import { mediaRouter } from './routes/media';
import { wasiyyahRouter } from './routes/wasiyyah';

const app = new Hono<{ Bindings: Bindings }>();

// গ্লোবাল মিডলওয়্যার
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// সিস্টেম হেলথ চেক
app.get('/', (c) => {
  return c.json({
    status: 'online',
    system: 'কর্জ্যে হাসানাহ (Qard al-Hasan) এজ ব্যাকএন্ড সার্ভিস',
    version: '1.0.0',
    shariahCompliance: 'Zero-Riba Guaranteed (AAOIFI Standard 19 Compliant)',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => c.text('OK'));

// API রাউট গ্রুপ
const api = app.basePath('/api/v1');
api.route('/auth', authRouter);
api.route('/dashboard', dashboardRouter);
api.route('/loans', loansRouter);
api.route('/repayments', repaymentsRouter);
api.route('/media', mediaRouter);
api.route('/wasiyyah', wasiyyahRouter);

// গ্লোবাল এরর হ্যান্ডলার
app.onError((err, c) => {
  console.error('Unhandled System Error:', err);
  return c.json(
    {
      success: false,
      error: 'সার্ভারে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
      detail: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    },
    500
  );
});

export default app;
