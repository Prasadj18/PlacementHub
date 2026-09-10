import api from './axios';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function getApplicationServerKey(publicKey: string): ArrayBuffer {
  const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
  const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const bytes = new Uint8Array(buffer);
  [...rawData].forEach((character, index) => {
    bytes[index] = character.charCodeAt(0);
  });
  return buffer;
}

async function getPublicKey(): Promise<string> {
  const response = await api.get<{ publicKey: string }>('/notifications/push/public-key');
  return response.data.publicKey;
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  return registration?.pushManager.getSubscription() || null;
}

export async function enablePushNotifications(): Promise<PushSubscription> {
  try {
    if (!isPushSupported()) {
      throw new Error('Push notifications are not supported by this browser.');
    }

    console.log('PUSH: starting notification permission request');
    const permission = await Notification.requestPermission();
    console.log('PUSH: notification permission result', permission);
    if (permission !== 'granted') {
      throw new Error(permission === 'denied'
        ? 'Notification permission was denied. You can enable it in your browser settings.'
        : 'Notification permission was not granted.');
    }

    console.log('PUSH: starting service worker registration');
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('PUSH: service worker registration result', {
      scope: registration.scope,
      state: registration.active?.state,
    });

    console.log('PUSH: fetching VAPID public key');
    const publicKey = await getPublicKey();
    console.log('PUSH: VAPID public key response/result', {
      present: Boolean(publicKey),
      length: publicKey.length,
    });

    console.log('PUSH: starting PushManager.subscribe()');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: getApplicationServerKey(publicKey),
    });
    console.log('PUSH: successful PushManager.subscribe()', {
      subscriptionCreated: true,
    });

    console.log('PUSH: starting POST subscription to backend');
    const payload = subscription.toJSON() as PushSubscriptionPayload;
    await api.post('/notifications/push/subscribe', payload);
    console.log('PUSH: successful backend subscription');
    return subscription;
  } catch (error) {
    const pushError = error as { name?: string; message?: string; stack?: string };
    console.error('PUSH REGISTRATION ERROR', error);
    console.error('PUSH REGISTRATION ERROR DETAILS', {
      name: pushError.name,
      message: pushError.message,
      stack: pushError.stack,
    });
    throw error;
  }
}

export async function disablePushNotifications(): Promise<void> {
  const subscription = await getPushSubscription();
  if (!subscription) return;

  await api.delete('/notifications/push/subscribe', { data: { endpoint: subscription.endpoint } });
  await subscription.unsubscribe();
}
