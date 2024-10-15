import { IncomingMessage } from 'http';
import { FastifyInstance, FastifyServerFactory } from 'fastify';
import { WebSocket } from 'ws';
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
export declare function createMinipaviHandler(minitelFactory: (ws: WebSocket, request: IncomingMessage) => any, options: MinipaviHandlerOptions): Promise<void>;
export {};
