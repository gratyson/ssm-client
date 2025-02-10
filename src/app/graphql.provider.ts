import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApplicationConfig, inject } from '@angular/core';
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { environment } from '../environments/environment';
import { ɵparseCookieValue } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';

const xsrfLink = new ApolloLink((operation, forward) => {
    operation.setContext({
        
        headers: new HttpHeaders().set("X-XSRF-TOKEN", parseXrsfToken()).set("Priority", "u=1")
    });

    return forward(operation);
});

const uri = environment.GRAPHQL_ENPOINT_URL;
export function apolloOptionsFactory(): ApolloClientOptions<any> {
    const httpLink = inject(HttpLink);
    return {
        link: xsrfLink.concat(httpLink.create({ uri })),
        cache: new InMemoryCache(),
    };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
    Apollo,
    {
        provide: APOLLO_OPTIONS,
        useFactory: apolloOptionsFactory,
    },
];

function parseXrsfToken(): string {
    for(const cookieVal of document.cookie.split(';')) {
        const cookieSplit = cookieVal.split("=");
        if (cookieSplit[0].trim() === "XSRF-TOKEN") {
            return cookieSplit[1].trim();
        }
    };
    
    return "";
}