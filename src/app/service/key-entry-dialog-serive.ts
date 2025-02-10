import { Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { KeyEntryDialogComponent } from "../dialog/key-entry-dialog/key-entry-dialog.component";

@Injectable({providedIn: "root"})
export class KeyEntryDialogService {

    constructor(private dialog: MatDialog) { }

    public showSaveDialog(keyId: string | null | undefined): Observable<string | undefined> {
        const prompt: string = keyId ? "Enter key password to save:" : "Enter account password to save:";

        return this.showDialog(prompt);
    }

    public showUnlockDialog(keyName: string | null | undefined): Observable<string | undefined> {
        const prompt: string = keyName ? `Enter key password for "${keyName}" to unlock` : "Enter password to unlock";

        return this.showDialog(prompt);
    }

    private showDialog(prompt: string): Observable<string | undefined> {
        const dialogRef: MatDialogRef<KeyEntryDialogComponent, string> = this.dialog.open(KeyEntryDialogComponent, {
            data: prompt, 
            height: KeyEntryDialogComponent.DEFAULT_HEIGHT,
            width: KeyEntryDialogComponent.DEFAULT_WIDTH,
            disableClose: true,
            autoFocus: true,
        });

        return dialogRef.afterClosed();
    }
}