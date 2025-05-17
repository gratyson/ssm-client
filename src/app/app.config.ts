import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientXsrfModule, provideHttpClient } from '@angular/common/http';
import { graphqlProvider } from './graphql.provider';

export const appConfig: ApplicationConfig = {
    providers: [
        [ provideRouter(routes, withComponentInputBinding()) ],
        provideAnimationsAsync(), 
        provideHttpClient(), 
        graphqlProvider,
        importProvidersFrom(HttpClientXsrfModule.withOptions({ cookieName: "XSRF-TOKEN", headerName: "X-XSRF-Token" }))
    ]
};
