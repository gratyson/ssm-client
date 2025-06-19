import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter, withComponentInputBinding, withRouterConfig } from "@angular/router";
import { routes } from "./app.routes";
import { provideHttpClient, withFetch, withXsrfConfiguration } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
    providers: [ 
      provideAnimations(), 
      [ provideRouter(routes, withComponentInputBinding()), withRouterConfig({paramsInheritanceStrategy: 'always'}) ], 
      provideHttpClient(withFetch(), withXsrfConfiguration({ cookieName: "XSRF-TOKEN", headerName: "X-XSRF-Token" }))
    ]
  };

function provideAnimations(): import("@angular/core").Provider | import("@angular/core").EnvironmentProviders {
    throw new Error("Function not implemented.");
}
