import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatMenuModule } from "@angular/material/menu";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AuthClient } from "../../../client/auth-client";
import { UserService } from "../../../security/user-service";

@Component({
    selector: "sm-header",
    templateUrl: "sm-header.html",
    styleUrl: "sm-header.css",
    imports: [MatFormFieldModule, MatIconModule, MatButtonModule, MatMenuModule ]
})
export class SmHeader {

    private userService: UserService = inject(UserService);
    private authClient: AuthClient = inject(AuthClient);

    username: string = "";

    public ngOnInit(): void {
        this.username = this.userService.username;
        this.userService.usernameChange.subscribe((username) => this.username = username);
    }

    onLogoutClick(event: Event): void {
        this.authClient.logout().subscribe(() => { 
            window.location.reload();
        });
    }

}