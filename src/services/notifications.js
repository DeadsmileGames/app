import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { api } from './api';

const TOKEN_KEY = 'deadsmile.push.token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerPushNotifications() {
  if (!Device.isDevice || !['android', 'ios'].includes(Platform.OS)) return null;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('publications', {
      name: 'Deadsmile Games publications',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: '#f80202',
      sound: 'default',
    });
  }
  let permissions = await Notifications.getPermissionsAsync();
  if (permissions.status !== 'granted') permissions = await Notifications.requestPermissionsAsync();
  if (permissions.status !== 'granted') return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) return null;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await syncPushToken(token);
  return token;
}

export async function syncPushToken(token) {
  if (!token || !['android', 'ios'].includes(Platform.OS)) return;
  await api.post('/platform/push-subscriptions', { token, platform: Platform.OS });
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function unregisterPushNotifications() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return;
  try {
    await api.delete('/platform/push-subscriptions', { token });
  } finally {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export { Notifications };
