import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { RestClientBase } from "./rest-client-base";
import { blob } from "stream/consumers";

const SAVE_FILE_PATH: string = "/save";
const LOAD_FILE_PATH: string = "/load";

@Injectable({providedIn: "root"})
export class SecretFileClient extends RestClientBase {
    
    constructor(private httpClient: HttpClient) {
        super("SecretFileClient");
    }

    public saveFile(fileName: string, keyId: string, keyPassword: string, secretFile: File): Observable<SaveSecretFileResponse> {
        const url: string = `${environment.SECRET_FILE_ENDPOINT_URL}${SAVE_FILE_PATH}`;

        let formData: FormData = new FormData();
        formData.append("request", new Blob([JSON.stringify({ "fileName": fileName, "keyId": keyId, "keyPassword": keyPassword })], { type: "application/json" }));
        formData.append("secretFile", secretFile);

        const options = { headers: new HttpHeaders({ "Accept": "application/json" }) };
        return this.httpClient.put<SaveSecretFileResponse>(url, formData, options)
            .pipe(catchError(this.handleError("saveFile", { success: false, fileId: "", errorMsg: "An error occurred on the server" })));
    }

    /*
    public loadFile(fileId: string, fileName: string, keyId: string, keyPassword: string): Observable<LoadSecretFileResponse> {
        const url: string = `${environment.SECRET_FILE_ENDPOINT_URL}${LOAD_FILE_PATH}`;

        const options = { headers: new HttpHeaders({ "Content-Type": "application/json", "Accept": "application/json" }) };
        return this.httpClient.post<LoadSecretFileResponse>(url, { "fileId": fileId, "fileName": fileName, "keyId": keyId, "keyPassword": keyPassword }, options)
            .pipe(catchError(this.handleError("loadFile", { success: false, file: null, errorMsg: "An error occured on the server" })));
    }
            */

    public loadFile(fileId: string, fileName: string, keyId: string, keyPassword: string): Observable<LoadSecretFileResponse> {
        const url: string = `${environment.SECRET_FILE_ENDPOINT_URL}${LOAD_FILE_PATH}`;

        const httpHeaders: HttpHeaders = new HttpHeaders({ "Content-Type": "application/json", "Accepts": "application/octet-stream" });
        return this.httpClient.post(url, { "fileId": fileId, "fileName": fileName, "keyId": keyId, "keyPassword": keyPassword }, { responseType: "blob", headers: httpHeaders})
            .pipe(map<Blob, LoadSecretFileResponse>(blob => { return { success: true, file: blob, errorMsg: "" } }))
            .pipe(catchError(this.handleError("loadFile", { success: true, file: null, errorMsg: "Failed to load file" })));
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