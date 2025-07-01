import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Get storage key for user-specific notifications
  const getStorageKey = (userId) => `notifications_${userId || 'default'}`;

  // Load notifications from localStorage on mount
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const userId = localStorage.getItem('user_id') || 'default';
        const storageKey = getStorageKey(userId);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedNotifications = JSON.parse(saved);
          // Filter out notifications older than 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const recentNotifications = parsedNotifications.filter(
            notification => new Date(notification.timestamp) > thirtyDaysAgo
          );
          setNotifications(recentNotifications);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    loadNotifications();
  }, []);

  // Save notifications to localStorage
  const saveNotifications = (notificationList) => {
    try {
      const userId = localStorage.getItem('user_id') || 'default';
      const storageKey = getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(notificationList));
    } catch (err) {
      console.error('Error saving notifications:', err);
    }
  };

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    setNotifications(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  // Get unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Predefined notification templates
  const createQuoteNotification = (vendorName, serviceType) => {
    addNotification({
      type: 'quote',
      title: 'New Quote Received',
      message: `You've received a quote from ${vendorName} for ${serviceType}`,
      vendorName,
      serviceType,
      icon: '💰',
      priority: 'high'
    });
  };

  const createMessageNotification = (vendorName, messageType = 'message') => {
    const messages = {
      message: `New message from ${vendorName}`,
      quote_update: `${vendorName} updated their quote`,
      vendor_saved: `You saved ${vendorName} to your favorites`
    };

    const titles = {
      message: 'New Message',
      quote_update: 'Quote Updated',
      vendor_saved: 'Vendor Saved'
    };

    addNotification({
      type: messageType === 'vendor_saved' ? 'favorite' : 'message',
      title: titles[messageType] || titles.message,
      message: messages[messageType] || messages.message,
      vendorName,
      icon: messageType === 'vendor_saved' ? '❤️' : '💬',
      priority: messageType === 'vendor_saved' ? 'low' : 'medium'
    });
  };

  const createBookingNotification = (vendorName, status = 'confirmed') => {
    const statusMessages = {
      confirmed: `Your booking with ${vendorName} has been confirmed`,
      declined: `${vendorName} declined your request`,
      pending: `Your request to ${vendorName} is pending review`
    };

    addNotification({
      type: 'booking',
      title: status === 'confirmed' ? 'Booking Confirmed' : 
             status === 'declined' ? 'Booking Declined' : 'Booking Pending',
      message: statusMessages[status],
      vendorName,
      status,
      icon: status === 'confirmed' ? '✅' : status === 'declined' ? '❌' : '⏳',
      priority: status === 'declined' ? 'high' : 'medium'
    });
  };

  const createMeetingNotification = (vendorName, date, time) => {
    addNotification({
      type: 'meeting',
      title: 'Upcoming Meeting',
      message: `You have a consultation with ${vendorName} tomorrow at ${time}`,
      vendorName,
      date,
      time,
      icon: '📅',
      priority: 'high'
    });
  };

  const createTaskNotification = (message, taskType = 'reminder') => {
    addNotification({
      type: 'task',
      title: 'Task Reminder',
      message,
      taskType,
      icon: '📋',
      priority: 'low'
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    // Template functions
    createQuoteNotification,
    createMessageNotification,
    createBookingNotification,
    createMeetingNotification,
    createTaskNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;