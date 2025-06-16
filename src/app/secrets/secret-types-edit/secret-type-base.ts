import { Component, Input } from "@angular/core";
import { SecretComponent, SecretInput } from "../../model/secret";
import { Observable, of } from "rxjs";

const ENCRYPTED_FIELD_PLACEHOLDER: string = "placeholder";   /// placeholder so user can see whether a field exists before decryption

@Component({
    selector: "secret-type-base",
    template: "",
    styles: "",
    standalone: true
})
export class SecretTypeBaseComponent {

    @Input() secretId: string;

    getFieldValue(component: SecretComponent | null): string {
        if (!component?.value) {
            return "";
        }

        if (component.encrypted) {
            return ENCRYPTED_FIELD_PLACEHOLDER;
        }

        return component.value;
    }

    hasEncryptedFieldValue(component: SecretComponent | null) {
        if (!component?.value) {
            return false;
        }

        return !!component.encrypted;
    }

    appendSecretComponents(secret: SecretInput): SecretInput {
        return secret;
    }

    beforeSave(secretToSave: SecretInput): Observable<BeforeSaveResult> {
        return of(NO_ACTION_BEFORE_SAVE_RESULT);
    }

    saveRequiresKeyPassword(): boolean {
        return false;
    }

    validateSecretComponents(): boolean {
        return true;
    }

    toComponentInput(oldComponent: SecretComponent | undefined | null, newValue: string) {
        return { 
            id: oldComponent?.id ? oldComponent.id : "",
            value: newValue
        };
    }

    contextOptions(): SecretTypeContextOption[] {
        return [];
    }

    onContextOptionSelect(contextOptionId: string): void {

    }
}

export interface SecretTypeContextOption {
    id: string;
    display: string;
}

export interface BeforeSaveResult {
    abortSave: boolean;
    errorMsg: string;
    updatedSecret: SecretInput | null;
}

export const NO_ACTION_BEFORE_SAVE_RESULT: BeforeSaveResult = {
    abortSave: false,
    errorMsg: "",
    updatedSecret: null
}