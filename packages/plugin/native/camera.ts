import { NativeHandle } from "../common/nativeHandle.ts";
import { DwebPlugin } from "./dweb-plugin.ts";

export enum CameraResultType {
    Uri = 'uri',
    Base64 = 'base64',
    DataUrl = 'dataUrl',
}

export enum CameraSource {
    /**
     * Prompts the user to select either the photo album or take a photo.
     */
    Prompt = 'PROMPT',
    /**
     * Take a new photo using the camera.
     */
    Camera = 'CAMERA',
    /**
     * Pick an existing photo from the gallery or photo album.
     */
    Photos = 'PHOTOS',
}
  
export enum CameraDirection {
    Rear = 'REAR',
    Front = 'FRONT',
}

export interface ImageOptions {
    /**
     * The quality of image to return as JPEG, from 0-100
     *
     * @since 1.0.0
     */
    quality?: number;
    /**
     * Whether to allow the user to crop or make small edits (platform specific).
     * On iOS 14+ it's only supported for CameraSource.Camera, but not for CameraSource.Photos.
     *
     * @since 1.0.0
     */
    allowEditing?: boolean;
    /**
     * How the data should be returned. Currently, only 'Base64', 'DataUrl' or 'Uri' is supported
     *
     * @since 1.0.0
     */
    resultType: CameraResultType;
    /**
     * Whether to save the photo to the gallery.
     * If the photo was picked from the gallery, it will only be saved if edited.
     * @default: false
     *
     * @since 1.0.0
     */
    saveToGallery?: boolean;
    /**
     * The desired maximum width of the saved image. The aspect ratio is respected.
     *
     * @since 1.0.0
     */
    width?: number;
    /**
     * The desired maximum height of the saved image. The aspect ratio is respected.
     *
     * @since 1.0.0
     */
    height?: number;
    /**
     * Whether to automatically rotate the image "up" to correct for orientation
     * in portrait mode
     * @default: true
     *
     * @since 1.0.0
     */
    correctOrientation?: boolean;
    /**
     * The source to get the photo from. By default this prompts the user to select
     * either the photo album or take a photo.
     * @default: CameraSource.Prompt
     *
     * @since 1.0.0
     */
    source?: CameraSource;
    /**
     * iOS and Web only: The camera direction.
     * @default: CameraDirection.Rear
     *
     * @since 1.0.0
     */
    direction?: CameraDirection;
  
    /**
     * iOS only: The presentation style of the Camera.
     * @default: 'fullscreen'
     *
     * @since 1.0.0
     */
    presentationStyle?: 'fullscreen' | 'popover';
  
    /**
     * Web only: Whether to use the PWA Element experience or file input. The
     * default is to use PWA Elements if installed and fall back to file input.
     * To always use file input, set this to `true`.
     *
     * Learn more about PWA Elements: https://capacitorjs.com/docs/web/pwa-elements
     *
     * @since 1.0.0
     */
    webUseInput?: boolean;
  
    /**
     * Text value to use when displaying the prompt.
     * @default: 'Photo'
     *
     * @since 1.0.0
     *
     */
    promptLabelHeader?: string;
  
    /**
     * Text value to use when displaying the prompt.
     * iOS only: The label of the 'cancel' button.
     * @default: 'Cancel'
     *
     * @since 1.0.0
     */
    promptLabelCancel?: string;
  
    /**
     * Text value to use when displaying the prompt.
     * The label of the button to select a saved image.
     * @default: 'From Photos'
     *
     * @since 1.0.0
     */
    promptLabelPhoto?: string;
  
    /**
     * Text value to use when displaying the prompt.
     * The label of the button to open the camera.
     * @default: 'Take Picture'
     *
     * @since 1.0.0
     */
    promptLabelPicture?: string;
}
  
export interface GalleryImageOptions {
    /**
     * The quality of image to return as JPEG, from 0-100
     *
     * @since 1.2.0
     */
    quality?: number;
    /**
     * The desired maximum width of the saved image. The aspect ratio is respected.
     *
     * @since 1.2.0
     */
    width?: number;
    /**
     * The desired maximum height of the saved image. The aspect ratio is respected.
     *
     * @since 1.2.0
     */
    height?: number;
    /**
     * Whether to automatically rotate the image "up" to correct for orientation
     * in portrait mode
     * @default: true
     *
     * @since 1.2.0
     */
    correctOrientation?: boolean;
  
    /**
     * iOS only: The presentation style of the Camera.
     * @default: 'fullscreen'
     *
     * @since 1.2.0
     */
    presentationStyle?: 'fullscreen' | 'popover';
  
    /**
     * iOS only: Maximum number of pictures the user will be able to choose.
     * @default 0 (unlimited)
     *
     * @since 1.2.0
     */
    limit?: number;
}

export class DwebCamera extends DwebPlugin {
    constructor() {
        super();
    }

    // 拍摄照片
    async takeCameraPhoto(option: ImageOptions) {
        return await this.onRequest(NativeHandle.TakeCameraPhoto, JSON.stringify(option));
    }

    // 从图库获取单张照片
    async pickCameraPhoto(option: ImageOptions) {
        return await this.onRequest(NativeHandle.PickCameraPhoto, JSON.stringify(option));
    }

    // 从图库获取多张照片
    async pickCameraPhotos(option: GalleryImageOptions) {
        return await this.onRequest(NativeHandle.PickCameraPhotos, JSON.stringify(option));
    }
}

if (!customElements.get("dweb-camera")) {
    customElements.define("dweb-camera", DwebCamera)
}