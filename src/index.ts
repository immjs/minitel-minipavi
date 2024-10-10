import http from 'http';
import { fastify, FastifyInstance, FastifyServerFactory } from 'fastify';
import { z } from 'zod';
import { WebSocketServer, WebSocket } from 'ws';

interface MinipaviHandlerOptions {
  version?: string;
  port: number;
  host: string;
  providePavi?: boolean;
  provideDirectUrl?: boolean;
  https?: boolean;
  serverFactory?: FastifyServerFactory;
  withFastify?: (server: FastifyInstance) => any;
}

export async function createMinipaviHandler(
  minitelFactory: (ws: WebSocket) => any,
  options: MinipaviHandlerOptions,
) {
  if (!options.port) throw new Error('Port is required');
  if (!options.host) throw new Error('Host is required');

  const fullOptions: Required<MinipaviHandlerOptions> = {
    version: '1.0',
    providePavi: false,
    provideDirectUrl: false,
    serverFactory: (handler, opts) => {
      return http.createServer((req, res) => {
        handler(req, res);
      });
    },
    withFastify: () => {},
    https: false,
    ...options,
  };

  const server = fastify({
    serverFactory: (...args) => {
      const server = fullOptions.serverFactory(...args);
      const wss = new WebSocketServer({ server });

      wss.on('connection', minitelFactory);

      return server;
    },
  });

  const paviSchema = z.object({
    PAVI: z.object({
      version: z.string(),
      uniqueId: z.string(),
      remoteAddr: z.string(),
      typesocket: z.string(), // you didn have to turn your vest like that lol
      versionminitel: z.string(),
      content: z.array(z.string()),
      context: z.any(),
      fctn: z.string(),
    }),
    URLPARAMS: z.record(z.string(), z.string()).optional(),
  });

  server.post('/', (req, res) => {
    const { success, data, error } = paviSchema.safeParse(req.body);

    if (!success)
      return res
        .status(400)
        .send(`Malformed request: ${JSON.stringify(error)}`);

    const newParams = new URLSearchParams();

    if (fullOptions.providePavi)
      newParams.append('pavi', JSON.stringify(data.PAVI));
    if (fullOptions.provideDirectUrl && 'DIRECTURL' in data)
      newParams.append('directUrl', JSON.stringify(data.DIRECTURL));

    res.header('Content-Type', 'application/json');
    return res.send(
      JSON.stringify({
        version: fullOptions.version,
        content: '',
        context: '',
        echo: 'off',
        next: `${fullOptions.https ? 'https' : 'http'}://${req.hostname}/disconnect`,
        directcall: 'no',
        COMMAND: {
          name: 'connectToWs',
          param: {
            key: 'Same host <https://npmjs.com/packages/minitel-minipavi>',
            host: fullOptions.https ? `ssl://${req.hostname}:443` : req.hostname,
            path: `/websocket${newParams.toString()}`,
            echo: 'off',
            case: 'lower',
            proto: '',
          },
        },
      }),
    );
  });

  server.post('/disconnect', (req, res) => {
    const { success, data, error } = paviSchema.safeParse(req.body);

    if (!success)
      return res
        .status(400)
        .send(`Malformed request: ${JSON.stringify(error)}`);

    res.send(
      JSON.stringify({
        version: fullOptions.version,
        content: '',
        context: '',
        echo: 'off',
        next: `${fullOptions.https ? 'https' : 'http'}://${req.hostname}/disconnect`,
        directcall: 'no',
        COMMAND: {
          name: 'libCnx',
        },
      }),
    );
  });

  await fullOptions.withFastify(server);

  return new Promise<void>((resolve) => {
    server.listen(
      {
        port: fullOptions.port,
        host: fullOptions.host,
      },
      () => resolve(),
    );
  });
}
