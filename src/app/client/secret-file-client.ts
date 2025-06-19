import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { blob } from "stream/consumers";
import { handleError } from "./client-util";

const SAVE_FILE_PATH: string = "/save";
const LOAD_FILE_PATH: string = "/load";

@Injectable({providedIn: "root"})
export class SecretFileClient {
    
    constructor(private httpClient: HttpClient) { }

    public saveFile(fileName: string, keyId: string, keyPassword: string, secretFile: File): Observable<SaveSecretFileResponse> {
        const url: string = `${environment.SECRET_FILE_ENDPOINT_URL}${SAVE_FILE_PATH}`;

        let formData: FormData = new FormData();
        formData.append("request", new Blob([JSON.stringify({ "fileName": fileName, "keyId": keyId, "keyPassword": keyPassword })], { type: "application/json" }));
        formData.append("secretFile", secretFile);

        const options = { headers: new HttpHeaders({ "Accept": "application/json" }) };
        return this.httpClient.put<SaveSecretFileResponse>(url, formData, options)
            .pipe(catchError(handleError("saveFile", { success: false, fileId: "", errorMsg: "An error occurred on the server" })));
    }

    public loadFile(fileId: string, fileName: string, keyId: string, keyPassword: string): Observable<LoadSecretFileResponse> {
        const url: string = `${environment.SECRET_FILE_ENDPOINT_URL}${LOAD_FILE_PATH}`;

        const httpHeaders: HttpHeaders = new HttpHeaders({ "Content-Type": "application/json", "Accepts": "application/octet-stream" });
        return this.httpClient.post(url, { "fileId": fileId, "fileName": fileName, "keyId": keyId, "keyPassword": keyPassword }, { responseType: "blob", headers: httpHeaders})
            .pipe(map<Blob, LoadSecretFileResponse>(blob => { return { success: true, file: blob, errorMsg: "" } }))
            .pipe(catchError(handleError("loadFile", { success: false, file: null, errorMsg: "Failed to load file" })));
    }
}

export interface SaveSecretFileResponse {
    success: boolean;
    fileId: string;
    errorMsg: string;
}

export interface LoadSecretFileResponse {
    success: boolean;
    file: Blob | null;
    errorMsg: string;
}