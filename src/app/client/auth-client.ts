import { Injectable } from "@angular/core";
import { Apollo, QueryRef, gql } from "apollo-angular";
import { Observable, from, map } from "rxjs";
import { handleErrors } from "./client-util";
import { AuthResponse, UserInput } from "../model/auth";
import { ApolloQueryResult } from "@apollo/client";
import { MutationResult } from "apollo-angular/types";

@Injectable({ providedIn: 'root' })
export class AuthClient {

    private static readonly LOGGED_IN_USERNAME_QUERY: string = `
    query loggedInUsername {
        loggedInUsername
    }`;

    private static readonly LOGIN_MUTATION: string = `
    mutation login($user: UserInput!) {
        login(user: $user) {
            success,
            errorMsg
        }
    }`;

    private static readonly REGISTER_MUTATION: string = `
    mutation register($user: UserInput!) {
        register(user: $user) {
            success,
            errorMsg
        }
    }`;

    private static readonly LOGOUT_MUTATION: string = `
    mutation logout {
        logout {
            success,
            errorMsg
        }
    }`;

    constructor(private apollo: Apollo) { }

    public getLoggedInUsername(): Observable<string> {
        const query: QueryRef<{ loggedInUsername: string }> = this.apollo.watchQuery({
            query: gql`${AuthClient.LOGGED_IN_USERNAME_QUERY}`
        });

        return from(query.refetch())
            .pipe(map(aqr => handleErrors(aqr, "getLoggedInUsername")))
            .pipe(map(aqr => aqr.data ? aqr.data.loggedInUsername : ""));
    }

    public login(username: string, password: string): Observable<AuthResponse> {
        return this.apollo.mutate<{ login: AuthResponse }, { user: UserInput}>({
            mutation: gql`${AuthClient.LOGIN_MUTATION}`,
            variables: {
                user: {
                  "username": username,
                  "password": password
                }
              }
        }).pipe(map(result => handleErrors(result, "login")))
          .pipe(map(result => result.data ? result.data.login : this.getErrorResult(result)));
    }

    public register(username: string, password: string): Observable<AuthResponse> {
        return this.apollo.mutate<{ register: AuthResponse }, { user: UserInput}>({
            mutation: gql`${AuthClient.REGISTER_MUTATION}`,
            variables: {
                user: {
                  "username": username,
                  "password": password
                }
              }
        }).pipe(map(result => handleErrors(result, "register")))
          .pipe(map(result => result.data ? result.data.register : this.getErrorResult(result)));
    }

    public logout(): Observable<AuthResponse> {
        return this.apollo.mutate<{ logout: AuthResponse }>({
            mutation: gql`${AuthClient.LOGOUT_MUTATION}`
        }).pipe(map(result => handleErrors(result, "logout")))
          .pipe(map(result => result.data ? result.data.logout : this.getErrorResult(result)));
    }

    private getErrorResult<T>(result: ApolloQueryResult<T> | MutationResult<T>): AuthResponse {
        if (result.errors) {
            return { success: false, errorMsg: result.errors[0].message };
        }

        return { success: false, errorMsg: "An unknown error occurred" };
    }
}