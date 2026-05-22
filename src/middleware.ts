import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
  if (url.pathname.startsWith('/admin')) {
    const adminUser = import.meta.env.ADMIN_USER;
    const adminPass = import.meta.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      if (import.meta.env.DEV) {
        return next();
      }
      return new Response('Admin credentials not configured. Please set ADMIN_USER and ADMIN_PASSWORD in environment variables.', { status: 500 });
    }

    const basicAuth = request.headers.get('authorization');
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      if (user === adminUser && pwd === adminPass) {
        return next();
      }
    }

    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Panel"',
      }
    });
  }

  return next();
});
