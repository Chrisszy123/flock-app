import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyAccessToken } from '../utils';
import { Role } from '../types';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  userRole?: Role;
  isAlive?: boolean;
}

interface BroadcastPayload {
  type: string;
  payload: {
    id: string;
    title: string;
    message: string;
    targetRole?: Role | null;
    createdAt: Date;
    createdBy?: { id: string; fullName: string; role: Role };
  };
}

let wss: WebSocketServer | null = null;

/**
 * Initializes WebSocket server attached to the existing HTTP server.
 * Authenticates clients via the token query parameter on connection.
 */
export function initWebSocket(server: HttpServer): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  // Heartbeat to detect stale connections
  const heartbeatInterval = setInterval(() => {
    wss?.clients.forEach((ws) => {
      const client = ws as AuthenticatedSocket;
      if (client.isAlive === false) {
        return client.terminate();
      }
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  wss.on('connection', (ws: AuthenticatedSocket, req) => {
    // Authenticate via query parameter: ws://host/ws?token=<jwt>
    try {
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      const payload = verifyAccessToken(token);
      ws.userId = payload.userId;
      ws.userRole = payload.role;
      ws.isAlive = true;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('error', () => {
        // Silently handle client errors
      });

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        payload: { message: 'WebSocket connected', userId: payload.userId },
      }));
    } catch {
      ws.close(4001, 'Invalid token');
    }
  });

  console.log('✅ WebSocket server initialized on /ws');
  return wss;
}

/**
 * Broadcasts a notification to connected clients.
 * If targetRole is specified, only clients with that role receive the message.
 */
export function broadcastNotification(data: BroadcastPayload): void {
  if (!wss) return;

  const message = JSON.stringify(data);

  wss.clients.forEach((ws) => {
    const client = ws as AuthenticatedSocket;

    if (client.readyState !== WebSocket.OPEN) return;

    // If targetRole is set, filter by role
    if (data.payload.targetRole && client.userRole !== data.payload.targetRole) {
      return;
    }

    client.send(message);
  });
}

/**
 * Gets the count of currently connected clients
 */
export function getConnectedClientsCount(): number {
  if (!wss) return 0;
  let count = 0;
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) count++;
  });
  return count;
}

export { wss };
