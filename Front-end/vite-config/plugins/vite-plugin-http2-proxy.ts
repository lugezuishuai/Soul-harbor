import { Plugin, Connect, ViteDevServer } from 'vite';
import proxy from 'http2-proxy';
import * as http from 'http';

export interface VitePluginHttp2ProxyOption {
  target: string;
  rewrite?: (url: string) => string;
  headers?: Record<string, number | string | string[] | undefined>;
  secure?: boolean;
  timeout?: number;
  proxyTimeout?: number;
  ws?: boolean;
}

export interface VitePreviewDevServer {
  middlewares: Connect.Server;
  httpServer: http.Server;
}

const error = (message: string) => {
  throw new Error(message);
};

export default (options: { [regexp: string]: VitePluginHttp2ProxyOption }): Plugin => {
  const configure = ({ middlewares, httpServer }: VitePreviewDevServer | ViteDevServer) => {
    for (const [
      regexp,
      { target, rewrite, headers, secure = true, timeout, proxyTimeout, ws = false },
    ] of Object.entries(options)) {
      const re = new RegExp(regexp);
      const tu = new URL(target);

      if (!tu.pathname.endsWith('/')) {
        tu.pathname += '/';
      }

      const protocol = /^https?:$/.test(tu.protocol)
        ? (tu.protocol.slice(0, -1) as 'https' | 'http')
        : error(`Invalid protocol: ${tu.href}`);

      const port =
        tu.port === ''
          ? { https: 443, http: 80 }[protocol]
          : /^\d+$/.test(tu.port)
          ? Number(tu.port)
          : error(`Invalid port: ${tu.href}`);

      middlewares.use((req, res, next) => {
        if (req.url && re.test(req.url)) {
          const url = (rewrite?.(req.url) ?? req.url).replace(/^\/+/, '');
          const { pathname, search } = new URL(url, tu);
          proxy.web(
            req,
            res,
            {
              protocol,
              port,
              hostname: tu.hostname,
              path: pathname + search,
              timeout,
              proxyTimeout,
              onReq: async (_, options) => {
                options.headers = {
                  ...options.headers,
                  ...headers,
                };
              },
              ['rejectUnauthorized' as never]: secure,
            },
            (err) => err && next(err),
          );
        } else {
          next();
        }
      });

      // if (httpServer && (ws || target.startsWith('ws:'))) {
      //   httpServer.on('upgrade', (req, socket, head) => {
      //     const url = (rewrite?.(req.url) ?? req.url).replace(/^\/+/, '');
      //     const { pathname, search } = new URL(url, tu);
      //     proxy.ws(req, socket, head, {
      //       protocol,
      //       port,
      //       hostname: tu.hostname,
      //       path: pathname + search,
      //       timeout,
      //       proxyTimeout,
      //       onReq: async (_, options) => {
      //         options.headers = {
      //           ...options.headers,
      //           ...headers,
      //         };
      //       },
      //       ['rejectUnauthorized' as never]: secure,
      //     });
      //   });
      // }
    }
  };

  return {
    name: '@jacksonhuang/vite-plugin-http2-proxy',
    configureServer: configure,
    configurePreviewServer: configure,
  };
};
