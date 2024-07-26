# `minitel-minipavi`

> [!NOTE]
> This is meant specifically for users of the `minitel-` ecosystem by me
> (immjs).
>
> It can also be used by whomever needs to hook up MiniPAVI with a websocket
> based minitel server.

Opens up an HTTP(s) server for access through minipavi

## Example

```tsx
import { Minitel, TextNode } from 'minitel-standalone';
import { DuplexBridge } from 'ws-duplex-bridge';
import { createMinipaviHandler } from 'minitel-minipavi';

createMinipaviHandler(
  (ws) => {
    const stream = new DuplexBridge(ws, { decodeStrings: false });
    const minitel = new Minitel(stream, {});
    minitel.appendChild(new TextNode('Hello world!', {}, minitel));

    minitel.renderToStream();

    setTimeout(() => stream.end(), 10_000);
  },
  {
    host: '0.0.0.0',
    port: 4545,
  },
).then(() => console.log('MiniPavi handler ready!'));
```

## Reference

### `createMinipaviHandler` Function

#### Returns

A Promise that will resolve when the MiniPAVI handler will be up and running

### Parameters

| Parameter        | Type                     | Description                                         |
| ---------------- | ------------------------ | --------------------------------------------------- |
| `minitelFactory` | `(ws: WebSocket) => any` | A factory function to handle WebSocket connections. |
| `options`        | `MinipaviHandlerOptions` | Configuration options for the handler.              |

### MinipaviHandlerOptions

| Option             | Type                                       | Description                                                                                                                                                                        |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`             | `number`                                   | Required. Specifies the port on which the server will listen.                                                                                                                      |
| `host`             | `string`                                   | Required. Specifies the host for the server. Note that `0.0.0.0` is the option to allow all incomming connections, while `127.0.0.1` will only allow connections from `127.0.0.1`. |
| `version`          | `string`                                   | Optional. Specifies the version that will be given to MiniPAVI. Defaults to `'1.0'`.                                                                                               |
| `providePavi`      | `boolean`                                  | Optional. If true, provides the PAVI field as query parameters. Defaults to `false`.                                                                                               |
| `provideDirectUrl` | `boolean`                                  | Optional. If true, provides the DIRECTURL field as query parameters. Defaults to `false`.                                                                                          |
| `https`            | `boolean`                                  | Optional. If true, enables HTTPS. You will have to create the HTTPS server yourself, either by using `serverFactory` or third party software such as nginx). Defaults to `false`.  |
| `serverFactory`    | `(handler: any, opts: any) => http.Server` | Optional. Custom server factory function. Defaults to creating an HTTP server.                                                                                                     |
| `withFastify`      | `(server: FastifyInstance) => any`         | Optional. Custom function to work with Fastify instance. Defaults to a no-op function.                                                                                             |
