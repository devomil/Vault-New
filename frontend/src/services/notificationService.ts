import { api } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'order' | 'inventory' | 'pricing' | 'system' | 'marketplace' | 'vendor';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    order: boolean;
    inventory: boolean;
    pricing: boolean;
    system: boolean;
    marketplace: boolean;
    vendor: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
}

class NotificationService {
  // Get user notifications
  async getNotifications(params?: {
    read?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      // Return default preferences
      return {
        id: 'default',
        userId: 'current',
        email: true,
        push: true,
        inApp: true,
        categories: {
          order: true,
          inventory: true,
          pricing: true,
          system: true,
          marketplace: true,
          vendor: true,
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
      };
    }
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await api.put('/notifications/preferences', preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  // Get notification templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await api.get('/notifications/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      return [];
    }
  }

  // Create notification template
  async createTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<NotificationTemplate> {
    try {
      const response = await api.post('/notifications/templates', template);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification template:', error);
      throw error;
    }
  }

  // Update notification template
  async updateTemplate(templateId: string, template: Partial<NotificationTemplate>): Promise<void> {
    try {
      await api.put(`/notifications/templates/${templateId}`, template);
    } catch (error) {
      console.error('Failed to update notification template:', error);
    }
  }

  // Delete notification template
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await api.delete(`/notifications/templates/${templateId}`);
    } catch (error) {
      console.error('Failed to delete notification template:', error);
    }
  }

  // Subscribe to real-time notifications (WebSocket simulation)
  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const mockNotifications: Notification[] = [
        {
          id: Date.now().toString(),
          title: 'New Order Received',
          message: 'Order #1234 has been received from Amazon',
          type: 'success',
          category: 'order',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/orders',
          priority: 'medium',
        },
        {
          id: (Date.now() + 1).toString(),
          title: 'Low Stock Alert',
          message: 'Product "Widget Pro" is running low on stock',
          type: 'warning',
          category: 'inventory',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/inventory',
          priority: 'high',
        },
        {
          id: (Date.now() + 2).toString(),
          title: 'Price Update',
          message: 'Competitor prices have changed for 5 products',
          type: 'info',
          category: 'pricing',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/pricing',
          priority: 'low',
        },
      ];

      // Randomly send a notification
      if (Math.random() < 0.3) {
        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        callback(randomNotification);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }

  // Get notification history
  async getNotificationHistory(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications/history', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
      return [];
    }
  }
}

export const notificationService = new NotificationService(); 