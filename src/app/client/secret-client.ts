import { Injectable } from "@angular/core";
import { Apollo, QueryRef, gql } from "apollo-angular";
import { DeleteSecretResponse, EMPTY_SECRET, Secret, SecretInput, SecretResponse, SecretsResponse, UnlockRequestInput } from "../model/secret";
import { handleErrors } from "./client-util";
import { Observable, from, map, of } from "rxjs";

const SECRET_ERROR_RESPONSE: SecretResponse = { success: false, secret: EMPTY_SECRET, errorMsg: "An error ocurred" };
const SECRETS_ERROR_RESPONSE: SecretsResponse = { success: false, secrets: [], errorMsg: "An error ocurred" };
const DELETE_SECRET_ERROR_RESPONSE: DeleteSecretResponse = { success: false, errorMsg: "An error ocurred" };

@Injectable({ providedIn: 'root' })
export class SecretClient {
    private static readonly ALL_OWNED_SECRETS_QUERY: string = `
    query allOwnedSecrets {
        ownedSecrets {
            success
            errorMsg
            secrets {
                id
                imageName
                name
                comments
                type {
                    id
                    name
                }
                websitePasswordComponents {
                    website {
                        value
                    }
                }
            }
        }
    }`;

    private static readonly GET_GENERAL_SECRET_DATA_QUERY: string = `
    query getGeneralSecretData($id: String!) {
        ownedSecret(id: $id) {
            success
            errorMsg
            secret {
                id
                imageName
                name
                comments
                type {
                    id
                }
                key {
                    id
                }
            }
        }
    }`;

    private static readonly GET_WEBSITE_PASSWORD_SECRET_DATA_QUERY: string = `
    query getWebsitePasswordSecretData($id: String!) {
        ownedSecret(id: $id) {
            success
            errorMsg
            secret {
                key {
                    id
                    name
                    type { 
                        id
                    }
                    salt
                }

                websitePasswordComponents {
                    website {
                        id
                        value
                        encrypted
                    }
                    username {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                    password {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                }
            }
        }
    }`;

    private static readonly GET_CREDIT_CARD_SECRET_DATA_QUERY: string = `
    query getCreditCardSecretData($id: String!) {
        ownedSecret(id: $id) {
            success
            errorMsg
            secret {
                key {
                    id
                    name
                    type { 
                        id
                    }
                    salt
                }

                creditCardComponents {
                    companyName {
                        id
                        value
                        encrypted
                    }
                    cardNumber {
                        id
                        value
                        encrypted
                    }
                    expirationMonth {
                        id
                        value
                        encrypted
                    }
                    expirationYear {
                        id
                        value
                        encrypted
                    }
                    securityCode {
                        id
                        value
                        encrypted
                    }
                }
            }
        }
    }`;

    private static readonly GET_TEXT_BLOB_SECRET_DATA_QUERY: string = `
    query getTextBlobSecretData($id: String!) {
        ownedSecret(id: $id) {
            success
            errorMsg
            secret {
                key {
                    id
                    name
                    type { 
                        id
                    }
                    salt
                }

                textBlobComponents {
                    textBlob {
                        id
                        value
                        encrypted
                    }
                }
            }
        }
    }`;

    private static readonly GET_SECRET_FILES_SECRET_DATA_QUERY: string = `
    query getSecretFilesSecretData($id: String!) {
        ownedSecret(id: $id) {
            success
            errorMsg
            secret {
                key {
                    id
                    name
                    type {
                        id
                    }
                    salt
                }

                filesComponents {
                    files {
                        fileId {
                            id
                            value
                            encrypted
                        }
                        fileName {
                            id
                            value
                            encrypted
                        }
                    }
                }
            }
        }
    }`;

    private static readonly SAVE_SECRET_MUTATION: string = `
    mutation saveSecret($secretInput: SecretInput!) {
        saveSecret(secretInput: $secretInput) {
            success
            errorMsg
            secret {
                id
                imageName
                name
                comments
                type {
                    id
                    name
                }
                key {
                    id
                }
                websitePasswordComponents {
                    website {
                        value
                    }
                }
            }
        }
    }`;

    private static readonly UNLOCK_WEBSITE_PASSWORD_SECRET_DATA_MUTATION: string = `
    mutation unlockSecret($unlockRequest: UnlockRequest!) {
        unlockSecret(unlockRequest: $unlockRequest) {
            success
            errorMsg
            secret {
                key {
                    id
                    name
                    type { 
                        id
                    }
                }

                websitePasswordComponents {
                    website {
                        id
                        value
                        encrypted
                    }
                    username {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                    password {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                }
            }
        }
    }`;

    private static readonly UNLOCK_CREDIT_CARD_SECRET_DATA_MUTATION: string = `
    mutation unlockSecret($unlockRequest: UnlockRequest!) {
        unlockSecret(unlockRequest: $unlockRequest) {
            success
            errorMsg
            secret {
                key {
                    id
                    name
                    type { 
                        id
                    }
                }

                creditCardComponents {
                    companyName {
                        id
                        value
                    }
                    cardNumber {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                    expirationMonth {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                    expirationYear {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                    securityCode {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                }
            }
        }
    }`;

    private static readonly UNLOCK_TEXT_BLOB_SECRET_DATA_MUTATION: string = `
    mutation unlockSecret($unlockRequest: UnlockRequest!) {
        unlockSecret(unlockRequest: $unlockRequest) {
            success
            errorMsg
            secret {
                key {
                    id
                    name
                    type { 
                        id
                    }
                }

                textBlobComponents {
                    textBlob {
                        id
                        value
                        encrypted
                        encryptionAlgorithm
                    }
                }
            }
        }
    }`;

    private static readonly UNLOCK_SECRET_FILES_SECRET_DATA_MUTATION: string = `
        mutation unlockSecret($unlockRequest: UnlockRequest!) {
        unlockSecret(unlockRequest: $unlockRequest) {
            success
            errorMsg
            secret {
                key {
                    id
                    name
                    type {
                        id
                    }
                }

                filesComponents {
                    files {
                        fileId {
                            id
                            value
                        }
                        fileName {
                            id
                            value
                            encrypted
                            encryptionAlgorithm
                        }
                    }
                }
            }
        }
    }`;

    private static readonly DELETE_SECRET_MUTATION: string = `
    mutation deleteSecret($secretId: String!) {
        deleteSecret(secretId: $secretId) {
            success
            errorMsg
        }
    }`;

    constructor(private apollo: Apollo) { }

    public getAllOwnedSecrets(): Observable<SecretsResponse> {
        const query: QueryRef<{ ownedSecrets: SecretsResponse }> = this.apollo.watchQuery({
            query: gql`${SecretClient.ALL_OWNED_SECRETS_QUERY}`
        });

        return from(query.refetch())
            .pipe(map(aqr => handleErrors(aqr, "getAllSecretTypes")))
            .pipe(map(aqr => aqr.data ? aqr.data.ownedSecrets : SECRETS_ERROR_RESPONSE));
    }

    public getGeneralSecretData(id: string): Observable<SecretResponse> {        
        return this.getOwnedSecretData(id, SecretClient.GET_GENERAL_SECRET_DATA_QUERY, "getGeneralSecretData");
    }

    public getWebsitePasswordSecretData(id: string): Observable<SecretResponse> {
        return this.getOwnedSecretData(id, SecretClient.GET_WEBSITE_PASSWORD_SECRET_DATA_QUERY, "getWebsitePasswordSecretData");
    }

    public getCreditCardSecretData(id: string): Observable<SecretResponse> {
        return this.getOwnedSecretData(id, SecretClient.GET_CREDIT_CARD_SECRET_DATA_QUERY, "getCreditCardSecretData");
    }

    public getTextBlobSecretData(id: string): Observable<SecretResponse> {
        return this.getOwnedSecretData(id, SecretClient.GET_TEXT_BLOB_SECRET_DATA_QUERY, "getTextBlobSecretData");
    }

    public getSecretFilesSecretData(id: string): Observable<SecretResponse> {
        return this.getOwnedSecretData(id, SecretClient.GET_SECRET_FILES_SECRET_DATA_QUERY, "getSecretFilesSecretData");
    }

    private getOwnedSecretData(id: string, gqlQuery: string, caller: string): Observable<SecretResponse> {
        const query: QueryRef<{ ownedSecret: SecretResponse }, { id: string }> = this.apollo.watchQuery({ 
            query: gql`${gqlQuery}`, 
            variables: {
                id: id
            }
        })

        return from(query.refetch())           
            .pipe(map(aqr => handleErrors(aqr, caller)))
            .pipe(map(aqr => aqr.data ? aqr.data.ownedSecret : SECRET_ERROR_RESPONSE));
    }

    public saveSecret(secretInput: SecretInput): Observable<SecretResponse> {
        return this.apollo.mutate<{ saveSecret: SecretResponse }, { secretInput: SecretInput }>({
            mutation: gql`${SecretClient.SAVE_SECRET_MUTATION}`,
            variables: {
                secretInput: secretInput
            }
        }).pipe(map(result => handleErrors(result, "saveSecret")))
          .pipe(map(result => result.data ? result.data.saveSecret : SECRET_ERROR_RESPONSE));
    }

    public unlockWebsitePasswordSecret(unlockRequest: UnlockRequestInput): Observable<SecretResponse> {
        return this.unlockSecret(unlockRequest, SecretClient.UNLOCK_WEBSITE_PASSWORD_SECRET_DATA_MUTATION, "unlockWebsitePasswordSecret");
    }

    public unlockCreditCardSecret(unlockRequest: UnlockRequestInput): Observable<SecretResponse> {
        return this.unlockSecret(unlockRequest, SecretClient.UNLOCK_CREDIT_CARD_SECRET_DATA_MUTATION, "unlockCreditCardSecret");
    }

    public unlockTextBlobSecret(unlockRequest: UnlockRequestInput): Observable<SecretResponse> {
        return this.unlockSecret(unlockRequest, SecretClient.UNLOCK_TEXT_BLOB_SECRET_DATA_MUTATION, "unlockTextBlobSecret");
    }

    public unlockFilesSecret(unlockRequest: UnlockRequestInput): Observable<SecretResponse> {
        return this.unlockSecret(unlockRequest, SecretClient.UNLOCK_SECRET_FILES_SECRET_DATA_MUTATION, "unlockFilesSecret");
    }

    private unlockSecret(unlockRequest: UnlockRequestInput, gqlQuery: string, caller: string): Observable<SecretResponse> {
        return this.apollo.mutate<{ unlockSecret: SecretResponse }, { unlockRequest: UnlockRequestInput }>({
            mutation: gql`${gqlQuery}`,
            variables: {
                unlockRequest: unlockRequest
            }
        }).pipe(map(result => handleErrors(result, caller)))
          .pipe(map(result => result.data ? result.data.unlockSecret : SECRET_ERROR_RESPONSE));
    }

    public deleteSecret(secretId: string): Observable<DeleteSecretResponse> {
        return this.apollo.mutate<{ deleteSecret: DeleteSecretResponse }, { secretId: string }>({
            mutation: gql`${SecretClient.DELETE_SECRET_MUTATION}`,
            variables: {
                secretId: secretId
            }
        }).pipe(map(result => handleErrors(result, "unlockSecret")))
          .pipe(map(result => result.data ? result.data.deleteSecret : DELETE_SECRET_ERROR_RESPONSE));
    }
}