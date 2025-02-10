import { Injectable } from "@angular/core";
import { DeleteKeyResponse, Key, SaveKeyInput, SaveKeyResponse, UpdateKeyInput } from "../model/key";
import { Observable, map } from "rxjs";
import { Apollo, gql } from "apollo-angular";
import { handleErrors } from "./client-util";

const SAVE_KEY_RESPONSE_ERROR: SaveKeyResponse = { success: false, key: null, errorMsg: "A client error occurred" }
const DELETE_KEY_RESPONSE_ERROR: DeleteKeyResponse = { success: false, errorMsg: "A client error occurred" }

@Injectable({ providedIn: 'root' })
export class KeyClient {

    private static readonly GET_ALL_OWNED_KEYS: string = `
    query ownedKeys {
        ownedKeys {
            id
            name
            comments
            type {
                name
            }
            imageName
        }
    }`;

    private static readonly GET_OWNED_KEY: string = `
    query ownedKey($id: String!) {
        ownedKey(id: $id) {
            id
            name
            comments
            type {
                id
            }
            imageName
        }
    }`;

    private static readonly SAVE_KEY_MUTATION: string = `
    mutation saveNewKey($saveKeyInput: SaveKeyInput!) {
        saveNewKey(saveKeyInput: $saveKeyInput) {
            success
            errorMsg
            key {
                id
                name
                comments
                type {
                    id
                    name
                }
                imageName
            }
        }
    }`;

    private static readonly UPDATE_KEY_MUTATION: string = `
    mutation updateKey($updateKeyInput: UpdateKeyInput!) {
        updateKey(updateKeyInput: $updateKeyInput) {
            success
            errorMsg
            key {
                id
                name
                comments
                type {
                    id
                    name
                }
                imageName
            }
        }
    }`;  

    private static readonly DELETE_KEY_MUTATION: string = `
    mutation deleteKey($keyId: String!) {
        deleteKey(keyId: $keyId) {
            success
            errorMsg
        }
    }`;

    constructor(private apollo: Apollo) { }

    public getAllOwnedKeys(): Observable<Key[]> {
        return this.apollo.query< { ownedKeys: Key[] }>({
            query: gql`${KeyClient.GET_ALL_OWNED_KEYS}`,
        }).pipe(map(result => handleErrors(result, "getAllOwnedKeys")))
          .pipe(map(result => result.data ? result.data.ownedKeys : []));
    }

    public getOwnedKey(id: string): Observable<Key | null> {
        return this.apollo.query< { ownedKey: Key }, { id: string }>({
            query: gql`${KeyClient.GET_OWNED_KEY}`,
            variables: {
                id: id
            }
        }).pipe(map(result => handleErrors(result, "getOwnedKey")))
          .pipe(map(result => result.data ? result.data.ownedKey : null));
    }

    public saveNewKey(saveKeyInput: SaveKeyInput): Observable<SaveKeyResponse> {
        return this.apollo.mutate<{ saveNewKey: SaveKeyResponse}, { saveKeyInput: SaveKeyInput }>({
            mutation: gql`${KeyClient.SAVE_KEY_MUTATION}`,
            variables: {
                saveKeyInput: saveKeyInput
            }
        }).pipe(map(result => handleErrors(result, "saveKey")))
          .pipe(map(result => result.data ? result.data.saveNewKey : SAVE_KEY_RESPONSE_ERROR));
    }

    public updateKey(updateKeyInput: UpdateKeyInput): Observable<SaveKeyResponse> {
        return this.apollo.mutate<{ updateKey: SaveKeyResponse}, { updateKeyInput: UpdateKeyInput }>({
            mutation: gql`${KeyClient.UPDATE_KEY_MUTATION}`,
            variables: {
                updateKeyInput: updateKeyInput
            }
        }).pipe(map(result => handleErrors(result, "saveKey")))
          .pipe(map(result => result.data ? result.data.updateKey : SAVE_KEY_RESPONSE_ERROR));
    }
    
    public deleteKey(keyId: string): Observable<DeleteKeyResponse> {
        return this.apollo.mutate<{ deleteKey: DeleteKeyResponse }, { keyId: string }>({
            mutation: gql`${KeyClient.DELETE_KEY_MUTATION}`,
            variables: {
                keyId: keyId
            }
        }).pipe(map(result => handleErrors(result, "deleteKey")))
          .pipe(map(result => result.data ? result.data.deleteKey : DELETE_KEY_RESPONSE_ERROR));
    }
}