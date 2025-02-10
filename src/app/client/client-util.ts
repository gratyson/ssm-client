import { ApolloQueryResult } from "@apollo/client";
import { MutationResult } from "apollo-angular/types";

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