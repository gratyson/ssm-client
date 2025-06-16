import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, of } from "rxjs";
import { environment } from "../../environments/environment";
import { SaveImageResult } from "../model/image";
import { RestClientBase } from "./rest-client-base";

@Injectable({providedIn: "root"})
export class ImageClient extends RestClientBase {
    
    constructor(private httpClient: HttpClient) {
        super("ImageClient");
    }

    public getImagePath(imageName: string): string {
        if (!imageName) {
            return "";
        }
        
        let params = new URLSearchParams();
        params.append("name", imageName);

        const url: string = environment.IMAGE_FILE_ENDPOINT_URL;
        return `${url}?${params}`;
    }

    public saveImage(imageName: string, imageFile: File): Observable<SaveImageResult> {
        const url: string = environment.IMAGE_FILE_ENDPOINT_URL;

        let formData: FormData = new FormData();
        formData.append("name", new Blob([JSON.stringify({ "name": imageName })], { type: "application/json" }));
        formData.append("imageFile", imageFile);

        const options = { headers: new HttpHeaders({ "Accept": "application/json" }) };
        return this.httpClient.put<SaveImageResult>(`${url}`, formData, options)
            .pipe(catchError(this.handleError("saveImage", { success: false, errorMsg: "An error occurred on the server" })))
    }

    public deleteImage(imageName: string): Observable<SaveImageResult> {
        const url: string = environment.IMAGE_FILE_ENDPOINT_URL;

        const options = { headers: new HttpHeaders({ "Accept": "application/json" }), body: imageName };
        return this.httpClient.delete<SaveImageResult>(`${url}`, options).pipe(catchError(this.handleError("deleteImage", { success: false, errorMsg: "An error occurred on the server" })));
    }



}

