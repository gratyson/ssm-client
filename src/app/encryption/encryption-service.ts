import { Injectable } from '@angular/core';
import { pbkdf2 } from 'crypto';
import { Observable, from, of, throwError } from 'rxjs';

const AES_ENCRYPTION_ALGORITH = "AES/CBC/PKCS5Padding";
const IV_LENGTH = 16;

@Injectable({ providedIn: 'root' })
export class EncryptionService {

    public decryptSecret(encodedCipherText: string, keyValue: string, componentId: string, salt: string, algorithm: string): Observable<{ success: boolean, decryptedText: string}> {
        if (algorithm === AES_ENCRYPTION_ALGORITH) {
            return from(this.decryptSecretAes(encodedCipherText, keyValue, componentId, salt));
        }

        const errMsg = "Unsupported encryption algorithm";
        console.error(errMsg);
        return throwError(() => errMsg);
    }

    private async decryptSecretAes(encodedCipherText: string, keyPassword: string, componentId: string, salt: string): Promise<{ success: boolean, decryptedText: string}> {
        const cipherText = this.base64Decode(encodedCipherText);

        try {
            const aesCbcParams: AesCbcParams = { name: "AES-CBC", iv: this.getBits(componentId, IV_LENGTH) };
            const cryptoKey: CryptoKey = await this.getCryptoKey(keyPassword, salt);
            const decryptedBytes: ArrayBuffer = await window.crypto.subtle.decrypt(aesCbcParams, cryptoKey, this.toBytes(cipherText));
            const decryptedString: string = new TextDecoder().decode(decryptedBytes);
            
            return { success: true, decryptedText: decryptedString };
        } catch (error) {
            console.error("Failed to decrypt: " + error);
        }

        return { success: false, decryptedText: "" };        
    }

    private async getCryptoKey(keyPassword: string, salt: string): Promise<CryptoKey> {
        const textEncoder = new TextEncoder();
        const keyPasswordBuffer = textEncoder.encode(keyPassword);
        const saltBuffer = textEncoder.encode(salt);

        const cryptoKey: CryptoKey = await window.crypto.subtle.importKey(
            "raw", 
            keyPasswordBuffer, 
            { name: "PBKDF2" }, 
            false, 
            [ "deriveBits" ]
        );

        const params: Pbkdf2Params = { name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations: 65536 };
        const bits: ArrayBuffer = await window.crypto.subtle.deriveBits(params, cryptoKey, 16 * 8);

        return window.crypto.subtle.importKey("raw", bits, { name: "AES-CBC" }, false, [ "encrypt", "decrypt" ]);
    }

    private toBytes(value: string): Uint8Array {
        let bytes: number[] = [];
        
        for(let i = 0; i < value.length; i++) {
            bytes.push(value.charCodeAt(i));
        }
        
        return new Uint8Array(bytes);
    }

    private base64Decode(encoded: string): string {
        return atob(encoded);
    }

    private getBits(strVal: string, size: number): Uint8Array {
        const secretIdBytes: Uint8Array = new TextEncoder().encode(strVal);
        
        let iv: Uint8Array = new Uint8Array(size);
        iv.fill(0);

        for (let i = 0; i < size && i < secretIdBytes.length; i++) {
            iv[i] = secretIdBytes[i];
        }

        return iv;
    }
}