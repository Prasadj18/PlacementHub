import { useState, useEffect } from 'react';
import {
  Bell, CheckCheck, CalendarPlus, CalendarClock, Info, Check,
} from 'lucide-react';
import { notificationsApi } from '../api/notifications';
import {
  disablePushNotifications, enablePushNotifications, getPushSubscription, isPushSupported,
} from '../api/push';
import { Notification as NotificationType } from '../types';

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'EVENT_CREATED': return <CalendarPlus size={18} />;
    case 'EVENT_UPDATED': return <CalendarClock size={18} />;
    case 'EVENT_REMINDER': return <Bell size={18} />;
    default: return <Info size={18} />;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'EVENT_CREATED': return '#10b981';
    case 'EVENT_UPDATED': return '#f59e0b';
    case 'EVENT_REMINDER': return '#6366f1';
    default: return '#3b82f6';
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState('');

  useEffect(() => {
    getPushSubscription()
      .then((subscription) => setPushEnabled(Boolean(subscription)))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handlePushToggle = async () => {
    setPushBusy(true);
    setPushMessage('');
    try {
      if (pushEnabled) {
        await disablePushNotifications();
        setPushEnabled(false);
        setPushMessage('Notifications disabled on this device.');
      } else {
        await enablePushNotifications();
        setPushEnabled(true);
        setPushMessage('Notifications enabled on this device.');
      }
    } catch (err) {
      setPushMessage(err instanceof Error ? err.message : 'Unable to update notification settings.');
    } finally {
      setPushBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllAsRead}>
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Browser notifications</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {pushEnabled ? 'Enabled on this device.' : 'Get important PlacementHub updates on this device.'}
            </p>
          </div>
          <button
            className={pushEnabled ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
            onClick={handlePushToggle}
            disabled={pushBusy || !isPushSupported()}
          >
            {pushBusy ? <div className="spinner" /> : pushEnabled ? 'Disable' : 'Enable Notifications'}
          </button>
        </div>
        {!isPushSupported() && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Push notifications are not available in this browser.
          </p>
        )}
        {pushMessage && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)' }}>
            {pushMessage}
          </p>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                padding: 'var(--space-4) var(--space-6)',
                borderBottom: index < notifications.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                background: notification.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.03)',
                transition: 'background var(--transition-fast)',
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-full)',
                background: getNotificationColor(notification.type) + '15',
                color: getNotificationColor(notification.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 2,
              }}>
                {getNotificationIcon(notification.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: notification.isRead ? 400 : 600,
                    color: 'var(--color-text)',
                  }}>
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      flexShrink: 0,
                    }} />
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {notification.message}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 4, display: 'inline-block' }}>
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>

              {!notification.isRead && (
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Mark as read"
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <Bell className="empty-state-icon" size={56} />
            <p className="empty-state-title">No notifications yet</p>
            <p className="empty-state-description">
              You'll receive notifications when events are created or updated for companies you've applied to.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
