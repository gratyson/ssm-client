import { ActivatedRouteSnapshot, CanActivateChildFn, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { SmHomeComponent } from './home/components/home/sm-home.component';
import { SecretsManagerComponent } from './secrets/secrets-manager/secrets-manager.component';
import { UserService } from './security/user-service';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { LoginComponent } from './security/login/login.component';
import { RegisterComponent } from './security/register/register.component';
import { KeysManagerComponent } from './keys/keys-manager/keys-manager.component';
import { KeyEditComponent } from './keys/key-edit/key-edit.component';
import { SecretEditComponent } from './secrets/secret-edit/secret-edit.component';

const loginGuardFunction: CanActivateChildFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const userService: UserService = inject(UserService);
    const router = inject(Router);
    
    return userService.refreshLoggedIn().pipe(map(isLoggedIn => {
        if (!isLoggedIn) {
            router.navigate([ 'app/login' ]);
        }

        return isLoggedIn;
    }));
}

export const routes: Routes = [
    { path: "app/login", component: LoginComponent },
    { path: "app/register", component: RegisterComponent },
    { path: "app", component: SmHomeComponent, canActivate: [loginGuardFunction], children: [
        { path: "secrets", component: SecretsManagerComponent, children: [
            { path: "edit", component: SecretEditComponent }
        ] },
        { path: "keys", component: KeysManagerComponent, children: [ 
            { path: "edit", component: KeyEditComponent }
        ] },
        { path: "", component: SecretsManagerComponent }
    ] },
    { path: '',   redirectTo: '/app', pathMatch: 'full' },
];
