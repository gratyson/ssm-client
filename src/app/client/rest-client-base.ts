import { Observable, of } from "rxjs";

export class RestClientBase {
    
    private clientName: string;

    constructor(clientName: string) {
        this.clientName = clientName;
    }

    protected handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.log(`${this.clientName}.${operation} failed: ${error.message}`);
            console.error(error);    
    
            return of(result as T);
        };
    }
}