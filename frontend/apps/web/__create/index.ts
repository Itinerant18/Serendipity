import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { skipCSRFCheck } from '@auth/core';
import Credentials from '@auth/core/providers/credentials';
import { authHandler, initAuthConfig } from '@hono/auth-js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { contextStorage, getContext } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { bodyLimit } from 'hono/body-limit';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import ws from 'ws';
import NeonAdapter from './adapter';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { isAuthAction } from './is-auth-action';
import { API_BASENAME, api } from './route-builder';
neonConfig.webSocketConstructor = ws;

const als = new AsyncLocalStorage<{ requestId: string }>();

// Override console methods to include request IDs
for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = NeonAdapter(pool);
*/

console.log('🔧 Server module loaded');

// Export default createHonoServer with configure callback
// This is the correct pattern for react-router-hono-server
export default createHonoServer({
  port: parseInt(process.env.PORT || '3000', 10),
  defaultLogger: true,
  configure: (app) => {
    // Middleware
    app.use('*', requestId());

    app.use('*', (c, next) => {
      const reqId = c.get('requestId');
      return als.run({ requestId: reqId }, () => next());
    });

    app.use(contextStorage());

    // Error handler
    app.onError((err, c) => {
      if (c.req.method !== 'GET') {
        return c.json(
          {
            error: 'An error occurred in your app',
            details: serializeError(err),
          },
          500
        );
      }
      return c.html(getHTMLForErrorPage(err), 200);
    });

    // CORS middleware
    if (process.env.CORS_ORIGINS) {
      app.use(
        '/*',
        cors({
          origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
        })
      );
    }

    // Body limit for mutations
    for (const method of ['post', 'put', 'patch'] as const) {
      app[method](
        '*',
        bodyLimit({
          maxSize: 4.5 * 1024 * 1024, // 4.5mb to match vercel limit
          onError: (c) => {
            return c.json({ error: 'Body size limit exceeded' }, 413);
          },
        })
      );
    }

    // Healthcheck endpoint for Railway
    app.get('/health', (c) => {
      return c.json({ status: 'ok', timestamp: new Date().toISOString() }, 200);
    });

    // Integrations proxy
    app.all('/integrations/:path{.+}', async (c, next) => {
      const queryParams = c.req.query();
      const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

      return proxy(url, {
        method: c.req.method,
        body: c.req.raw.body ?? null,
        // @ts-ignore - this key is accepted even if types not aware and is
        // required for streaming integrations
        duplex: 'half',
        redirect: 'manual',
        headers: {
          ...c.req.header(),
          'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
          'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
          Host: process.env.NEXT_PUBLIC_CREATE_HOST,
          'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
        },
      });
    });

    // Auth handler
    app.use('/api/auth/*', async (c, next) => {
      if (isAuthAction(c.req.path)) {
        return authHandler()(c, next);
      }
      return next();
    });

    // Register API routes
    app.route(API_BASENAME, api);

    console.log('✅ Server configured with custom routes');
  },
});
