import { Injectable } from "@angular/core";
import { CacheService } from "./cache-service";
import { Observable } from "rxjs";
import { KeyTypeClient } from "../client/key-type-client";
import { KeyType } from "../model/key";

const KEY_TYPES_CACHE_KEY = "KEY-TYPES";

@Injectable({providedIn: "root"})
export class KeyTypeService {

    constructor(private keyTypeClient: KeyTypeClient, 
                private cacheService: CacheService) { }


    public getAllKeyTypes(): Observable<KeyType[]> {
        return this.cacheService.getValue(KEY_TYPES_CACHE_KEY, () => this.keyTypeClient.getAllKeyTypes());
    }
}