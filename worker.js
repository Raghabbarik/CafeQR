export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy any /api requests directly to the live Render backend
    if (url.pathname.startsWith('/api')) {
      const backendUrl = `https://cafeqr-tckh.onrender.com${url.pathname}${url.search}`;

      const newHeaders = new Headers(request.headers);
      newHeaders.set('host', 'cafeqr-tckh.onrender.com');

      const proxyReq = new Request(backendUrl, {
        method: request.method,
        headers: newHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'follow',
      });

      return fetch(proxyReq);
    }

    // Serve static frontend assets from ./dist
    return env.ASSETS.fetch(request);
  },
};
