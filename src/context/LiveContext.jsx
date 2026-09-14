import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { api, API_URL, SITE_URL } from '../services/api';
import { Notifications, registerPushNotifications, syncPushToken } from '../services/notifications';
import { useAuth } from './AuthContext';

const LiveContext = createContext({ revision: 0, notifications: [], unread: 0, markAllRead: () => {} });
const EVENTS_KEY = 'deadsmile.live.after';
const INBOX_KEY = 'deadsmile.notifications';

function routeFromUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, SITE_URL);
    if (url.origin !== new URL(SITE_URL).origin) return null;
    if (url.pathname.startsWith('/games/')) return url.pathname.replace('/games/', '/game/');
    if (url.pathname.startsWith('/news/')) return url.pathname;
    if (url.pathname.startsWith('/videos/')) return url.pathname.replace('/videos/', '/video/');
  } catch {}
  return null;
}

export function LiveProvider({ children }) {
  const router = useRouter();
  const { status } = useAuth();
  const [revision, setRevision] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const afterRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.multiGet([EVENTS_KEY, INBOX_KEY])
      .then((values) => {
        afterRef.current = Number(values[0][1] || 0);
        initializedRef.current = afterRef.current > 0;
        try { setNotifications(JSON.parse(values[1][1] || '[]')); } catch { setNotifications([]); }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(INBOX_KEY, JSON.stringify(notifications.slice(0, 50))).catch(() => {});
  }, [notifications]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    registerPushNotifications().catch(() => {});
    const subscription = Notifications.addPushTokenListener((token) => {
      syncPushToken(token.data).catch(() => {});
    });
    return () => subscription.remove();
  }, [status]);

  useEffect(() => {
    const open = (response) => {
      const route = routeFromUrl(response.notification.request.content.data?.url);
      if (route) router.push(route);
    };
    const responseSub = Notifications.addNotificationResponseReceivedListener(open);
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const content = notification.request.content;
      setNotifications((current) => [{
        id: notification.request.identifier,
        title: content.title || 'Deadsmile Games',
        message: content.body || 'New content is available.',
        url: content.data?.url || null,
        createdAt: new Date().toISOString(),
        unread: true,
      }, ...current.filter((item) => item.id !== notification.request.identifier)]);
    });
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        open(response);
        Notifications.clearLastNotificationResponseAsync().catch(() => {});
      }
    }).catch(() => {});
    return () => {
      responseSub.remove();
      receivedSub.remove();
    };
  }, [router]);

  useEffect(() => {
    if (!hydrated || status === 'loading') return undefined;
    let active = true;
    let socket = null;
    let retryTimer = null;
    let pollTimer = null;

    const remember = (event) => {
      const id = Number(event?.id || 0);
      if (id > afterRef.current) {
        afterRef.current = id;
        AsyncStorage.setItem(EVENTS_KEY, String(id)).catch(() => {});
      }
    };

    const consume = (event) => {
      remember(event);
      setRevision((value) => value + 1);
      if (!event?.event_type?.endsWith('.published')) return;
      setNotifications((current) => {
        const item = {
          id: `content-${event.id}`,
          title: event.payload?.title || 'Deadsmile Games',
          message: event.payload?.preview || 'New content is available.',
          url: event.payload?.url || null,
          createdAt: event.created_at || new Date().toISOString(),
          unread: true,
        };
        return current.some((entry) => entry.id === item.id) ? current : [item, ...current];
      });
    };

    const poll = async () => {
      try {
        const events = await api.get('/platform/events', { after: afterRef.current, limit: 100 });
        if (!active || !Array.isArray(events)) return;
        if (!initializedRef.current) {
          events.forEach(remember);
          initializedRef.current = true;
          return;
        }
        events.forEach(consume);
      } catch {}
    };

    const connect = async () => {
      let ticket = '';
      if (status === 'authenticated') {
        try { ticket = (await api.get('/platform/live-ticket'))?.ticket || ''; } catch {}
      }
      if (!active) return;
      const base = API_URL.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
      socket = new WebSocket(`${base}/api/live${ticket ? `?ticket=${encodeURIComponent(ticket)}` : ''}`);
      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data);
          if (event.type !== 'connected') consume(event);
        } catch {}
      };
      socket.onclose = () => {
        if (active) retryTimer = setTimeout(connect, 4000);
      };
      socket.onerror = () => socket?.close();
    };

    poll();
    connect();
    pollTimer = setInterval(poll, 15000);
    return () => {
      active = false;
      socket?.close();
      clearTimeout(retryTimer);
      clearInterval(pollTimer);
    };
  }, [hydrated, status]);

  const value = useMemo(() => ({
    revision,
    notifications,
    unread: notifications.filter((item) => item.unread).length,
    markAllRead: () => setNotifications((items) => items.map((item) => ({ ...item, unread: false }))),
    openNotification: (item) => {
      const route = routeFromUrl(item.url);
      setNotifications((items) => items.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry));
      if (route) router.push(route);
    },
  }), [notifications, revision, router]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}

export function useLive() {
  return useContext(LiveContext);
}
