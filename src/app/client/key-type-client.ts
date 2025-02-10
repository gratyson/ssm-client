import { Injectable } from "@angular/core";
import { Apollo, QueryRef, gql } from "apollo-angular";
import { Observable, from, map } from "rxjs";
import { handleErrors } from "./client-util";
import { KeyType } from "../model/key";

@Injectable({ providedIn: 'root' })
export class KeyTypeClient {

  private static readonly ALL_KEY_TYPES_QUERY: string = `
    query allKeyTypes {
      keyTypes {
        id
        name
        abbr
      }
    }`;
  private readonly allKeyTypesQueryRef: QueryRef<{ keyTypes: KeyType[] }>;

  constructor(private apollo: Apollo) {
    this.allKeyTypesQueryRef = this.apollo.watchQuery({
      query: gql`${KeyTypeClient.ALL_KEY_TYPES_QUERY}`
    });
  }

  public getAllKeyTypes(): Observable<KeyType[]> {
    return from(this.allKeyTypesQueryRef.refetch())
      .pipe(map(aqr => handleErrors(aqr, "getAllKeyTypes")))
      .pipe(map(aqr => aqr.data ? aqr.data.keyTypes : []));
  }
}
