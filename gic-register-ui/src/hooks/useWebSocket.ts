import { useEffect, useRef, useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/api';
import type { AdminNotification } from '@/types';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  latestNotification: AdminNotification | null;
  clearNotification: () => void;
}

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/ws`;

export function useWebSocket(): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] = useState<AdminNotification | null>(null);

  const clearNotification = useCallback(() => {
    setLatestNotification(null);
  }, []);

  const connect = useCallback(() => {
    const token = getAccessToken();
    if (!token) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          if (data.type === 'ADMIN_NOTIFICATION') {
            setLatestNotification(data.payload);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // WebSocket connection failed — retry
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, latestNotification, clearNotification };
}
