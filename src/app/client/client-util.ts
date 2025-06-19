
import { ApolloQueryResult } from "@apollo/client";
import { MutationResult } from "apollo-angular/types";
import { Observable, of } from "rxjs";

export function handleErrors<T>(result: ApolloQueryResult<T> | MutationResult<T>, funcName: string): ApolloQueryResult<T> | MutationResult<T> {
    if (result.errors) {
        result.errors.forEach((error) => {
            console.log(`${funcName} failed: ${error.message}`);
            console.error(error);
        });
    }

    return result;
}

export function responseOrDefault<T>(result: ApolloQueryResult<{ response: T }> | MutationResult<{ response: T }>, defaultVal: T): T {
    if (result.data) {
        return result.data.response;
    }

    return defaultVal;
}

export function handleGqlError<T>(operation = "operation", result: T): (error: any) => Observable<ApolloQueryResult<T> | MutationResult<T>> {
    return handleError(operation, generateAqr(result));
}

export function handleError<T>(operation = 'operation', result?: T): (error: any) => Observable<T> {
    return (error: any): Observable<T> => {

      console.log(`${operation} failed: ${error.message}`);
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
}

export function generateAqr<T>(result: T): ApolloQueryResult<T> {
    return {
        data: result,
        loading: false,
        networkStatus: 7    // ready
    }
}