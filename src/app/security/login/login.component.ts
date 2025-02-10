import { Component, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { AuthClient } from "../../client/auth-client";

@Component({
    selector: "ssrs-login",
    standalone: true,
    templateUrl: "login.html",
    styleUrl: "login.css",
    imports: [ FormsModule, ReactiveFormsModule, MatGridListModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule ],
    host: { ["(document:keypress)"]: "onKeypress($event)" }
})
export class LoginComponent { 

    private authClient: AuthClient = inject(AuthClient);
    //private cacheService: CacheService = inject(CacheService);
    private router: Router = inject(Router);

    warningMessage: string = "";

    username: string = "";
    password: string = "";

    onKeypress(event: KeyboardEvent): void {
        if (event.key === "Enter") {
            this.submit();
        } 
    }

    onSubmit(event: Event): void {
        this.submit();
    }

    private submit(): void {
        if (!this.username) {
            this.warningMessage = "Username is required";
        } else if(!this.password) {
            this.warningMessage = "Password is required";
        } else {
            this.authClient.login(this.username, this.password).subscribe(response => {
                if (response) {
                    if (response.success) {
                        //this.cacheService.clearValue(USER_CONFIG_CACHE_KEY);
                        this.router.navigate(["/"]);
                    } else {
                        this.warningMessage = response.errorMsg ? response.errorMsg : "Unspecified error occurred";
                    }
                } else {
                    this.warningMessage = "An unknown error occurred";
                }
            });
        }
    }
}