/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('../src/data/posDb', () => ({
  initializeDatabase: jest.fn(async () => {}),
  loadSnapshot: jest.fn(async () => {
    const {seedProducts, seedReceipts, seedSettings} = require('../src/seed');

    return {
      products: seedProducts,
      receipts: seedReceipts,
      settings: seedSettings,
    };
  }),
  upsertProduct: jest.fn(async () => {}),
  deleteProductById: jest.fn(async () => {}),
  updateProductStock: jest.fn(async () => {}),
  saveStoreSettings: jest.fn(async () => {}),
  persistReceipt: jest.fn(async () => {}),
}));

jest.mock('react-native-camera-kit', () => ({
  Camera: 'Camera',
  CameraType: {
    Back: 'back',
  },
}));

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: {CAMERA: 'ios.camera'},
    ANDROID: {CAMERA: 'android.camera'},
  },
  RESULTS: {
    GRANTED: 'granted',
    LIMITED: 'limited',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
  },
  check: jest.fn(async () => 'granted'),
  request: jest.fn(async () => 'granted'),
  openSettings: jest.fn(async () => {}),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
