"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMinipaviHandler = createMinipaviHandler;
const http_1 = __importDefault(require("http"));
const fastify_1 = require("fastify");
const zod_1 = require("zod");
const ws_1 = require("ws");
async function createMinipaviHandler(minitelFactory, options) {
    if (!options.port)
        throw new Error('Port is required');
    if (!options.host)
        throw new Error('Host is required');
    const fullOptions = {
        version: '1.0',
        providePavi: false,
        provideDirectUrl: false,
        serverFactory: (handler, opts) => {
            return http_1.default.createServer((req, res) => {
                handler(req, res);
            });
        },
        withFastify: () => { },
        https: false,
        ...options,
    };
    const server = (0, fastify_1.fastify)({
        serverFactory: (...args) => {
            const server = fullOptions.serverFactory(...args);
            const wss = new ws_1.WebSocketServer({ server });
            wss.on('connection', minitelFactory);
            return server;
        },
    });
    const paviSchema = zod_1.z.object({
        PAVI: zod_1.z.object({
            version: zod_1.z.string().regex(/^(\d+\.)*\d+$/g),
            uniqueId: zod_1.z.string().regex(/^\d+$/g),
            remoteAddr: zod_1.z.string(),
            typesocket: zod_1.z.enum(['websocketssl', 'websocket', 'other']),
            versionminitel: zod_1.z.string().regex(/^\x01.{3}\x04$/g),
            content: zod_1.z.array(zod_1.z.string()),
            context: zod_1.z.any(),
            fctn: zod_1.z.enum([
                'ENVOI',
                'SUITE',
                'RETOUR',
                'ANNULATION',
                'CORRECTION',
                'GUIDE',
                'REPETITION',
                'SOMMAIRE',
                'CNX',
                'FIN',
                'DIRECT',
                'DIRECTCNX',
                'DIRECTCALLFAILED',
                'DIRECTCALLENDED',
                'BGCALL',
                'BGCALL-SIMU',
            ]),
        }),
        URLPARAMS: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
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
        return res.send(JSON.stringify({
            version: fullOptions.version,
            content: '',
            context: '',
            echo: 'off',
            next: `http://${req.hostname}/disconnect`,
            directcall: 'no',
            COMMAND: {
                name: 'connectToWs',
                param: {
                    key: 'Same host <https://npmjs.com/packages/minitel-minipavi>',
                    host: req.hostname,
                    path: `/websocket${newParams.toString()}`,
                    echo: 'off',
                    case: 'lower',
                    proto: fullOptions.https ? 'wss' : 'ws',
                },
            },
        }));
    });
    server.post('/disconnect', (req, res) => {
        const { success, data, error } = paviSchema.safeParse(req.body);
        if (!success)
            return res
                .status(400)
                .send(`Malformed request: ${JSON.stringify(error)}`);
        res.send(JSON.stringify({
            version: fullOptions.version,
            content: '',
            context: '',
            echo: 'off',
            next: `http://${req.hostname}/disconnect`,
            directcall: 'no',
            COMMAND: {
                name: 'libCnx',
            },
        }));
    });
    await fullOptions.withFastify(server);
    return new Promise((resolve) => {
        server.listen({
            port: fullOptions.port,
            host: fullOptions.host,
        }, () => resolve());
    });
}
