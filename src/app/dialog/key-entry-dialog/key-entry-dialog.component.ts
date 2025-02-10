import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
    selector: "key-entry-dialog",
    templateUrl: "key-entry-dialog.html",
    styleUrl: "key-entry-dialog.css",
    standalone: true,
    imports: [ FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule ],
})
export class KeyEntryDialogComponent {

    public static readonly DEFAULT_HEIGHT: string = "12rem";
    public static readonly DEFAULT_WIDTH: string = "24rem";

    promptLabel: string = "Enter key password";
    keyValue: string = "";

    constructor(
        public dialogRef: MatDialogRef<KeyEntryDialogComponent, string>,
        @Inject(MAT_DIALOG_DATA) public prompt: string,
    ) {}

    public ngOnInit(): void {
        if (this.prompt) {
            this.promptLabel = this.prompt;
        }
    }

    onCancel() {
        this.dialogRef.close("");
    }

    onAccept() {
        this.dialogRef.close(this.keyValue);
    }

    onKeypress(event: KeyboardEvent) {
        if (event.key === "Enter") {
            this.dialogRef.close(this.keyValue);
        }
    }
}