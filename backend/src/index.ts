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

// Global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// System health check
app.get('/', (c) => {
  return c.json({
    status: 'online',
    system: 'Qard al-Hasan Edge Backend Service',
    version: '1.0.0',
    shariahCompliance: 'Zero-Riba Guaranteed (AAOIFI Standard 19 Compliant)',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => c.text('OK'));

// API Route Groups
const api = app.basePath('/api/v1');
api.route('/auth', authRouter);
api.route('/dashboard', dashboardRouter);
api.route('/loans', loansRouter);
api.route('/repayments', repaymentsRouter);
api.route('/media', mediaRouter);
api.route('/wasiyyah', wasiyyahRouter);

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled System Error:', err);
  return c.json(
    {
      success: false,
      error: 'An internal server error occurred. Please try again later.',
      detail: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    },
    500
  );
});

export default app;
