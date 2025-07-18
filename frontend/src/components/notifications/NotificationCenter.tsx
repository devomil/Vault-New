import React, { useState, useEffect } from 'react';
import { Bell, X, Settings, Check, Trash2, Filter, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { notificationService, Notification, NotificationPreferences } from '../../services/notificationService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadPreferences();
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return;
    
    const updatedPreferences = { ...preferences, ...updates };
    await notificationService.updatePreferences(updatedPreferences);
    setPreferences(updatedPreferences);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || notification.category === activeTab;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 border-r bg-gray-50">
                <TabsList className="flex flex-col h-full w-full bg-transparent">
                  <TabsTrigger value="all" className="w-full justify-start">
                    All Notifications
                  </TabsTrigger>
                  <TabsTrigger value="order" className="w-full justify-start">
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="inventory" className="w-full justify-start">
                    Inventory
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="w-full justify-start">
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="system" className="w-full justify-start">
                    System
                  </TabsTrigger>
                  <TabsTrigger value="marketplace" className="w-full justify-start">
                    Marketplace
                  </TabsTrigger>
                  <TabsTrigger value="vendor" className="w-full justify-start">
                    Vendors
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                <TabsContent value="all" className="flex-1 m-0">
                  <NotificationList
                    notifications={filteredNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="order" className="flex-1 m-0">
                  <NotificationList
                    notifications={filteredNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="inventory" className="flex-1 m-0">
                  <NotificationList
                    notifications={filteredNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="pricing" className="flex-1 m-0">
                  <NotificationList
                    notifications={filteredNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="system" className="flex-1 m-0">
                  <NotificationList
                    notifications={filteredNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="marketplace" className="flex-1 m-0">
                  <NotificationList
                    notifications={filteredNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    loading={loading}
                  />
                </TabsContent>
                <TabsContent value="vendor" className="flex-1 m-0">
                  <NotificationList
                    notifications={filteredNotifications}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDeleteNotification}
                    loading={loading}
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Preferences Panel */}
        {preferences && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Notification Preferences</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.email}
                    onChange={(e) => handleUpdatePreferences({ email: e.target.checked })}
                    className="rounded"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.push}
                    onChange={(e) => handleUpdatePreferences({ push: e.target.checked })}
                    className="rounded"
                  />
                  <span>Push</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={preferences.inApp}
                    onChange={(e) => handleUpdatePreferences({ inApp: e.target.checked })}
                    className="rounded"
                  />
                  <span>In-App</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
  loading
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 border-b hover:bg-gray-50 transition-colors ${
            !notification.read ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                  <span className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {notification.category}
                </Badge>
                {notification.actionUrl && (
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    View Details
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter; 