import { Injectable, inject } from "@angular/core";
import { AuthClient } from "../client/auth-client";
import { BehaviorSubject, Observable, map, of } from "rxjs";

@Injectable({providedIn: "root"})
export class UserService {

    private authClient: AuthClient = inject(AuthClient);

    private usernameSource: BehaviorSubject<string> = new BehaviorSubject<string>("");

    public username: string = "";
    public usernameChange: Observable<string> = this.usernameSource.asObservable();

    public refreshLoggedIn(): Observable<boolean> {
        return this.authClient.getLoggedInUsername().pipe(map(username => {
            if (username) {
                this.username = username;
                this.usernameSource.next(username);
                return this.isLoggedIn();
            }
            return false;
        }))
    }

    public isLoggedIn(): boolean {
        return !!this.username;
    }    
}