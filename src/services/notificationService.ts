import { Platform } from 'react-native';
import type { Product } from '../types';

// Lazily requirement to avoid crash at import time if native module is missing
const getNotifee = () => {
  try {
    return require('@notifee/react-native').default;
  } catch (e) {
    return null;
  }
};

const getNotifeeConstants = () => {
  try {
    const notifee = require('@notifee/react-native');
    return {
      AndroidImportance: notifee.AndroidImportance,
      AuthorizationStatus: notifee.AuthorizationStatus,
    };
  } catch (e) {
    return {
      AndroidImportance: { HIGH: 4 },
      AuthorizationStatus: { AUTHORIZED: 1 },
    };
  }
};

class NotificationService {
  private channelId: string = 'inventory-alerts';

  async initialize() {
    const notifee = getNotifee();
    if (!notifee) {
      console.warn('Notifee: Native module not found. Rebuild required.');
      return;
    }

    try {
      const { AuthorizationStatus, AndroidImportance } = getNotifeeConstants();
      const settings = await notifee.requestPermission();
      
      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('Notification permission granted.');
      }

      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: this.channelId,
          name: 'Inventory Alerts',
          importance: AndroidImportance.HIGH,
          description: 'Notifications for low stock.',
        });
      }
    } catch (error) {
      console.warn('Notifee: Initialization failed.', error);
    }
  }

  async notifyLowStock(products: Product[]) {
    if (products.length === 0) return;
    const notifee = getNotifee();
    if (!notifee) return;

    try {
      const { AndroidImportance } = getNotifeeConstants();
      const title = products.length === 1 ? 'Low Stock Alert' : 'Inventory Attention Needed';
      const body = products.length === 1
        ? `${products[0].name} has only ${products[0].stock} units left.`
        : `${products.length} items are low on stock.`;

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
        },
      });
    } catch (error) {
      console.warn('Notifee: Failed to display notification.', error);
    }
  }
}

export const notificationService = new NotificationService();
