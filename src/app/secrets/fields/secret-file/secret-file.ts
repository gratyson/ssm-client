export interface SecretFile {
    fileId: string;
    fileName: string;
    isNewFile: boolean;
    file: File | null;
}