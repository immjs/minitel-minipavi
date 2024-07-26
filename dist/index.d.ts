import { FastifyServerFactory } from 'fastify';
import { WebSocket } from 'ws';
interface MinipaviHandlerOptions {
    version?: string;
    port: number;
    host: string;
    providePavi?: boolean;
    provideDirectUrl?: boolean;
    https?: boolean;
    serverFactory?: FastifyServerFactory;
}
export declare function createMinipaviHandler(minitelFactory: (ws: WebSocket) => any, options: MinipaviHandlerOptions): Promise<void>;
export {};
