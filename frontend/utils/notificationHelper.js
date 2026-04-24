/* THIS IS FOR NOTIFEE THAT WONT WORK IN EXPO GO
import { Platform } from 'react-native';

export const scheduleDailyOutfitNotification = async (hours, minutes) => {
  // 1. Exit immediately if on Web
  if (Platform.OS === 'web') {
    console.log('Notifications skipped: Not supported on Web.');
    return;
  }

  try {
    // 2. Load the module
    const notifeeModule = require('@notifee/react-native');

    // 3. SAFETY CHECK: If we are in Expo Go, notifeeModule.default will be undefined.
    // We check this to prevent the "Cannot read property 'default' of undefined" error.
    if (!notifeeModule || !notifeeModule.default) {
      console.warn("⚠️ Notifee Native Module not found. This is normal in Expo Go.");
      console.log(`[SIMULATED] Notification would be set for ${hours}:${minutes}`);
      return; // Exit here so it doesn't crash the app
    }

    const notifee = notifeeModule.default;
    const { TriggerType, RepeatFrequency, AndroidImportance } = notifeeModule;

    // Request permissions
    await notifee.requestPermission();

    // Create Android Channel
    const channelId = await notifee.createChannel({
      id: 'daily-outfit',
      name: 'Daily Outfit Reminders',
      importance: AndroidImportance.HIGH,
    });

    // Calculate the timestamp
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);

    // If time already passed today, set for tomorrow
    if (date < new Date()) {
      date.setDate(date.getDate() + 1);
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: true, 
    };

    await notifee.createTriggerNotification(
      {
        title: '👗 Ready for your DripCheck?',
        body: "Tap to see today's weather-perfect outfit!",
        android: { 
          channelId,
          pressAction: { id: 'default' } 
        },
      },
      trigger,
    );
    
    console.log(`✅ Notification scheduled for ${hours}:${minutes}`);
  } catch (error) {
    // This catches the "Native module not found" error specifically
    console.error("Caught Notification Error:", error.message);
  }
};
*/
// EXPO NOTIFICATION
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// FIXED THE WARNING: Replaced shouldShowAlert with shouldShowBanner
// UPDATED HANDLER: Fixed deprecation warnings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Keep for backward compatibility
    shouldShowBanner: true, // ADDED for new Expo version
    shouldShowList: true,   // ADDED for new Expo version
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleDailyOutfitNotification = async (hours, minutes) => {
  if (Platform.OS === 'web') return;

  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const safeHours = Number(hours);
    const safeMinutes = Number(minutes);

    const now = new Date();
    const target = new Date();
    target.setHours(safeHours, safeMinutes, 0, 0);

    // If target is in the past or within 10 seconds, move to tomorrow
    if (target.getTime() <= now.getTime() + 10000) {
      target.setDate(target.getDate() + 1);
    }

    // Android Channel Setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-outfits', {
        name: 'Daily Outfit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    // Clear old ones
    await Notifications.cancelAllScheduledNotificationsAsync();
    await new Promise(resolve => setTimeout(resolve, 500)); 

    // THE FINAL FIX: Using explicit SchedulableTriggerInputTypes
    const triggerParams = Platform.OS === 'android'
      ? {
          // Change from DATE to DAILY to bypass strict Android 14/15/16 'Exact' blocks
          type: Notifications.SchedulableTriggerInputTypes.DAILY, 
          hour: safeHours,
          minute: safeMinutes,
          channelId: 'daily-outfits',
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: safeHours,
          minute: safeMinutes,
          repeats: true,
        };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "👗 DripCheck Reminder",
        body: "Tap to see today's weather-perfect outfit!",
        sound: true,
      },
      trigger: triggerParams,
    });

    console.log(`✅ Targeted for: ${target.toLocaleTimeString()}`);
  } catch (error) {
    console.error("Scheduling Error:", error);
  }
};

export const testInstantNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "DripCheck Test 🚀",
      body: "This is what your daily reminder looks like!",
    },
    trigger: Platform.OS === 'android' 
      ? { seconds: 2, channelId: 'daily-outfits' }
      : { seconds: 2 },
  });
};