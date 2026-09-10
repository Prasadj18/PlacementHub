import webpush from 'web-push';
import { PushSubscription } from '@prisma/client';
import prisma from '../utils/prisma';
import { env } from '../config/env';

export interface PushSubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

function configureWebPush(): void {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
    throw Object.assign(new Error('Web Push is not configured on the server'), { statusCode: 503 });
  }

  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

function isValidSubscription(subscription: unknown): subscription is PushSubscriptionInput {
  if (!subscription || typeof subscription !== 'object') return false;
  const value = subscription as Record<string, unknown>;
  const keys = value.keys as Record<string, unknown> | undefined;
  return typeof value.endpoint === 'string'
    && value.endpoint.length > 0
    && !!keys
    && typeof keys.p256dh === 'string'
    && keys.p256dh.length > 0
    && typeof keys.auth === 'string'
    && keys.auth.length > 0;
}

export class PushService {
  async saveSubscription(userId: string, input: unknown): Promise<PushSubscription> {
    if (!isValidSubscription(input)) {
      throw Object.assign(new Error('Invalid push subscription'), { statusCode: 400 });
    }

    return prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint: input.endpoint } },
      update: { p256dh: input.keys.p256dh, auth: input.keys.auth },
      create: {
        userId,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
      },
    });
  }

  async removeSubscription(userId: string, input: unknown): Promise<void> {
    if (!input || typeof input !== 'object' || typeof (input as { endpoint?: unknown }).endpoint !== 'string') {
      throw Object.assign(new Error('A subscription endpoint is required'), { statusCode: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: { userId, endpoint: (input as { endpoint: string }).endpoint },
    });
  }

  async sendToSubscription(subscription: PushSubscription, payload: PushNotificationPayload): Promise<void> {
    configureWebPush();
    let endpointDescription = subscription.endpoint.slice(0, 24);
    try {
      const endpointUrl = new URL(subscription.endpoint);
      endpointDescription = `${endpointUrl.origin}${endpointUrl.pathname.slice(0, 12)}`;
    } catch (_error) {
      // Keep a short, non-secret prefix if the endpoint is not a valid URL.
    }

    console.log('PUSH SERVER: sending notification', {
      endpoint: endpointDescription,
    });

    try {
      const result = await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      }, JSON.stringify(payload));
      console.log('PUSH SERVER: webpush.sendNotification succeeded', {
        statusCode: result.statusCode,
      });
    } catch (error: unknown) {
      const pushError = error as {
        name?: string;
        message?: string;
        statusCode?: number;
        body?: unknown;
        headers?: unknown;
      };
      console.error('PUSH SERVER: webpush.sendNotification failed', {
        name: pushError.name,
        message: pushError.message,
        statusCode: pushError.statusCode,
        body: pushError.body,
        headers: pushError.headers,
      });

      const statusCode = pushError.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: subscription.id } });
      }
      throw error;
    }
  }

  async sendToUser(userId: string, payload: PushNotificationPayload): Promise<void> {
    const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
    console.log('PUSH SERVER: subscriptions found', {
      userId,
      count: subscriptions.length,
    });

    const results = await Promise.allSettled(
      subscriptions.map((subscription) => this.sendToSubscription(subscription, payload)),
    );
    const successfulSends = results.filter((result) => result.status === 'fulfilled').length;
    const failedSends = results.filter((result) => result.status === 'rejected').length;
    console.log('PUSH SERVER: send summary', {
      successfulSends,
      failedSends,
    });

    const failed = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (failed) {
      throw failed.reason;
    }
  }

  getPublicKey(): string {
    if (!env.VAPID_PUBLIC_KEY) {
      throw Object.assign(new Error('Web Push is not configured on the server'), { statusCode: 503 });
    }
    return env.VAPID_PUBLIC_KEY;
  }
}

export const pushService = new PushService();
