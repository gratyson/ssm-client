export interface SaveImageResult {
    success: boolean;
    errorMsg: string;
}

export type ImageSourceType = "path" | "name";
export const PATH_IMAGE_SOURCE_TYPE: ImageSourceType = "path";
export const NAME_IMAGE_SOURCE_TYPE: ImageSourceType = "name";