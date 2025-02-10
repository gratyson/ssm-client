import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Key } from "../model/key";
import { Injectable } from "@angular/core";
import { Secret } from "../model/secret";

@Injectable({providedIn: "root"})
export class UpdateNotificationService {

    private updatedKeySource: Subject<Key> = new Subject<Key>();
    private updatedSecretSource: Subject<Secret> = new Subject<Secret>();
    private updatedImagePathSource: Subject<string> = new Subject<string>();

    private deletedKeySource: Subject<string> = new Subject<string>();
    private deletedSecretSource: Subject<string> = new Subject<string>();

    public updatedKey: Observable<Key> = this.updatedKeySource.asObservable();
    public updatedSecret: Observable<Secret> = this.updatedSecretSource.asObservable();
    public updatedImagePath: Observable<string> = this.updatedImagePathSource.asObservable();

    public deletedKey: Observable<string> = this.deletedKeySource.asObservable();
    public deletedSecret: Observable<string> = this.deletedSecretSource.asObservable();

    public publishUpdatedKey(key: Key): void {
        this.updatedKeySource.next(key);
    }

    public publishUpdatedSecret(secret: Secret): void {
        this.updatedSecretSource.next(secret);
    }

    public publishUpdatedImagePath(imagePath: string): void {
        this.updatedImagePathSource.next(imagePath);
    }

    public publishDeletedSecret(secretId: string): void {
        this.deletedSecretSource.next(secretId);
    }

    public publishDeletedKey(keyId: string): void {
        this.deletedKeySource.next(keyId);
    }
}

