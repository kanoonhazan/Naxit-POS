import {Platform} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
} from 'react-native-permissions';

export type CameraPermissionState =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

function getCameraPermission() {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.CAMERA;
  }

  return PERMISSIONS.ANDROID.CAMERA;
}

export async function ensureCameraPermission(): Promise<CameraPermissionState> {
  const permission = getCameraPermission();
  const currentStatus = await check(permission);

  if (currentStatus === RESULTS.GRANTED || currentStatus === RESULTS.LIMITED) {
    return 'granted';
  }

  if (currentStatus === RESULTS.BLOCKED) {
    return 'blocked';
  }

  if (currentStatus === RESULTS.UNAVAILABLE) {
    return 'unavailable';
  }

  const requestedStatus = await request(permission);

  if (requestedStatus === RESULTS.GRANTED || requestedStatus === RESULTS.LIMITED) {
    return 'granted';
  }

  if (requestedStatus === RESULTS.BLOCKED) {
    return 'blocked';
  }

  if (requestedStatus === RESULTS.UNAVAILABLE) {
    return 'unavailable';
  }

  return 'denied';
}

export async function openDeviceSettings() {
  await openSettings();
}
