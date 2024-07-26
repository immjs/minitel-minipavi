import { Minitel, TextNode } from 'minitel-standalone';
import { DuplexBridge } from 'ws-duplex-bridge';
import { createMinipaviHandler } from '..';

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
