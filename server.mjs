import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketManager } from './backend/lib/websocket/server.js';
import { logger } from './backend/lib/utils/logger.js';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    if (!req.url) {
      res.statusCode = 400;
      res.end('Bad Request: Missing URL');
      return;
    }

    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wsManager = new WebSocketManager(server);

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url || '/', true);
    if (pathname === '/websocket') {
      wsManager.handleUpgrade(req, socket, head, (ws) => {
        wsManager.wss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    logger.info(`> Ready on http://localhost:${port}`);
    logger.info(`WebSocket server running on ws://localhost:${port}/websocket`);
  });
}).catch((err) => {
  logger.error("❌ Error starting server", { error: err });
  process.exit(1);
});
