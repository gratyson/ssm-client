import { Key } from "./key";

export interface Secret {
    id: string;
    imageName: string | null;
    name: string | null;
    comments: string | null;
    type: SecretType | null;
    key: Key | null;

    websitePasswordComponents: WebsitePasswordComponents | null;
    creditCardComponents: CreditCardComponents | null;
    textBlobComponents: TextBlobComponents | null;
};

export interface SecretType {
    id: string | null;
    name: string | null;
    abbr: string | null;
};

export interface WebsitePasswordComponents {
    website: SecretComponent | null;
    username: SecretComponent | null;
    password: SecretComponent | null;
};

export interface CreditCardComponents {
    companyName: SecretComponent | null;
    cardNumber: SecretComponent | null;
    expirationMonth: SecretComponent | null;
    expirationYear: SecretComponent | null;
    securityCode: SecretComponent | null;
};

export interface TextBlobComponents {
    textBlob: SecretComponent | null;
}

export interface SecretComponent {
    id: string | null;
    value: string | null;
    encrypted: boolean | null;
    encryptionAlgorithm: string | null;
};

export const WEBSITE_PASSWORD_SECRET_TYPE_ID = "website_password";
export const CREDIT_CARD_SECRET_TYPE_ID = "credit_card";
export const TEXT_BLOB_SECRET_TYPE_ID = "text_blob";

export const EMPTY_SECRET_COMPONENT: SecretComponent = { id: "", value: "", encrypted: false, encryptionAlgorithm: "" };
export const EMPTY_SECRET: Secret = { id: "", imageName: "", name: "", type: null, key: null, comments: "", websitePasswordComponents: null, creditCardComponents: null, textBlobComponents: null };

export interface SecretInput {
    id: string;
    imageName: string;
    name: string;
    comments: string;
    typeId: string;
    keyId: string;
    keyPassword: string;

    websitePasswordComponents: WebsitePasswordComponentsInput | null;
    creditCardComponents: CreditCardComponentsInput | null;
    textBlobComponents: TextBlobComponentsInput | null;
}

export interface SecretResponse {
    success: boolean | null;
    secret: Secret | null;
    errorMsg: string | null;
}

export interface SecretsResponse {
    success: boolean | null;
    secrets: Secret[] | null;
    errorMsg: string | null; 
}

export interface DeleteSecretResponse {
    success: boolean | null;
    errorMsg: string | null; 
}

export interface  WebsitePasswordComponentsInput {
    website: SecretComponentInput | null;
    username: SecretComponentInput | null;
    password: SecretComponentInput | null;
}

export interface CreditCardComponentsInput {
    companyName: SecretComponentInput | null; 
    cardNumber: SecretComponentInput | null;
    expirationMonth: SecretComponentInput | null;
    expirationYear: SecretComponentInput | null;
    securityCode: SecretComponentInput | null;
}

export interface TextBlobComponentsInput {
    textBlob: SecretComponentInput | null;
}

export interface SecretComponentInput {
    id: string | null;
    value: string | null;
}

export interface UnlockRequestInput {
    secretId: string;
    keyPassword: string;
}