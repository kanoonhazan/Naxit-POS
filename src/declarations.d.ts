

declare module 'react-native-qrcode-svg' {
  import {Component} from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    quietZone?: number;
    logo?: any;
    logoSize?: number;
    logoBackgroundColor?: string;
    logoMargin?: number;
    logoBorderRadius?: number;
    ecl?: 'L' | 'M' | 'Q' | 'H';
  }

  export default class QRCode extends Component<QRCodeProps> {}
}

declare module 'react-native-camera-kit' {
  import {Component} from 'react';
  import {ViewStyle} from 'react-native';

  export enum CameraType {
    Back = 'back',
    Front = 'front',
  }

  interface CameraProps {
    style?: ViewStyle;
    cameraType?: CameraType;
    scanBarcode?: boolean;
    showFrame?: boolean;
    laserColor?: string;
    frameColor?: string;
    onReadCode?: (event: {nativeEvent: {codeStringValue: string}}) => void;
    onError?: (error: any) => void;
  }

  export class Camera extends Component<CameraProps> {}
}
