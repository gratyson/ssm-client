import { Component, Input } from "@angular/core";
import { Secret, SecretComponent, SecretInput } from "../../model/secret";

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