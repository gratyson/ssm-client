import { Injectable } from "@angular/core";
import { Apollo, QueryRef, gql } from "apollo-angular";
import { ApolloQueryResult } from "@apollo/client";
import { catchError, from, map, of, Observable } from "rxjs";
import { SecretType } from "../model/secret";
import { handleErrors } from "./client-util";

@Injectable({ providedIn: 'root' })
export class SecretTypeClient {

  private readonly ALL_SECRET_TYPES_QUERY: string = `
    query allSecretTypes {
      secretTypes {
        id
        name
        abbr
      }
    }`;
  private readonly allSecretTypesQueryRef: QueryRef<{ secretTypes: SecretType[] }>;

  constructor(private apollo: Apollo) {
    this.allSecretTypesQueryRef = this.apollo.watchQuery({
      query: gql`${this.ALL_SECRET_TYPES_QUERY}`
    });
  }

  public getAllSecretTypes(): Observable<SecretType[]> {
    return from(this.allSecretTypesQueryRef.refetch())
      .pipe(map(aqr => handleErrors(aqr, "getAllSecretTypes")))
      .pipe(map(aqr => aqr.data ? aqr.data.secretTypes : []));
  }
}

