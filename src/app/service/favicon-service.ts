import { Injectable } from "@angular/core";

@Injectable({providedIn: "root"})
export class FaviconService {
    
    public getFaviconPath(url: string): string {
        let baseUrl: string = url;

        const protocolSeparator = baseUrl.indexOf("//");
        if (protocolSeparator >= 0) {
            baseUrl = baseUrl.substring(protocolSeparator + 1, baseUrl.length);
        }

        const pathSeparator = baseUrl.indexOf("/");
        if (pathSeparator > 0) {
            baseUrl = baseUrl.substring(0, pathSeparator);
        }

        const pathComponents: string[] = baseUrl.split(".");
        if (pathComponents.length >= 2) {
            return `http://${pathComponents[pathComponents.length - 2]}.${pathComponents[pathComponents.length - 1]}/favicon.ico`;
        }

        return "";
    }
}