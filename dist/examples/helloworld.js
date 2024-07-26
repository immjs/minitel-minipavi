"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minitel_standalone_1 = require("minitel-standalone");
const ws_duplex_bridge_1 = require("ws-duplex-bridge");
const __1 = require("..");
(0, __1.createMinipaviHandler)((ws) => {
    const stream = new ws_duplex_bridge_1.DuplexBridge(ws, { decodeStrings: false });
    const minitel = new minitel_standalone_1.Minitel(stream, {});
    minitel.appendChild(new minitel_standalone_1.TextNode('Hello world!', {}, minitel));
    minitel.renderToStream();
    setTimeout(() => stream.end(), 10000);
}, {
    host: '0.0.0.0',
    port: 4545,
}).then(() => console.log('MiniPavi handler ready!'));
