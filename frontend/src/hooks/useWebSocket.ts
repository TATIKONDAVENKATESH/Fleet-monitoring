import { useEffect, useRef, useCallback } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { LiveLocation, Alert } from '../types';

interface UseWebSocketOptions {
  onLocationUpdate?: (location: LiveLocation) => void;
  onAlertUpdate?: (alert: Alert) => void;
  /** FIX H7: New callbacks so Layout can track connection status */
  onConnect?: () => void;
  onDisconnect?: () => void;
  enabled?: boolean;
}

export const useWebSocket = ({
  onLocationUpdate,
  onAlertUpdate,
  onConnect,
  onDisconnect,
  enabled = true,
}: UseWebSocketOptions) => {
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<StompSubscription[]>([]);

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !enabled) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws/tracking'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        onConnect?.();
        const subs: StompSubscription[] = [];

        if (onLocationUpdate) {
          subs.push(
            client.subscribe('/topic/locations', (msg) => {
              try { onLocationUpdate(JSON.parse(msg.body)); } catch { /* ignore */ }
            })
          );
        }

        if (onAlertUpdate) {
          subs.push(
            client.subscribe('/topic/alerts', (msg) => {
              try { onAlertUpdate(JSON.parse(msg.body)); } catch { /* ignore */ }
            })
          );
        }

        subscriptionsRef.current = subs;
      },
      onDisconnect: () => {
        onDisconnect?.();
        subscriptionsRef.current = [];
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        onDisconnect?.();
      },
    });

    client.activate();
    clientRef.current = client;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const disconnect = useCallback(() => {
    subscriptionsRef.current.forEach((s) => s.unsubscribe());
    clientRef.current?.deactivate();
    clientRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { disconnect, reconnect: () => { disconnect(); connect(); } };
};