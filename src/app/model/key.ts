export interface Key {
    id: string | null;
    imageName: string | null;
    name: string | null;
    type: KeyType | null;
    comments: string | null;
    salt: string | null;
    algorithm: string | null;
}

export interface KeyType {
    id: string | null;
    name: string | null;
    abbr: string | null;
}

export interface SaveKeyInput {
    imageName: string | null;
    typeId: string | null;
    name: string | null;
    comments: string | null;
    keyPassword: string | null;
}

export interface UpdateKeyInput {
    id: string | null;
    imageName: string | null;
    name: string | null;
    comments: string | null;
}

export interface SaveKeyResponse {
    success: boolean | null;
    key: Key | null;
    errorMsg: string | null;
}

export interface DeleteKeyResponse {
    success: boolean | null;
    errorMsg: string | null;
}

export const DIRECT_LOCK_KEY_ID = "direct_lock";