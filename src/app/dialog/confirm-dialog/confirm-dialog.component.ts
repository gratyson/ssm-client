import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
    selector: "confirm-dialog",
    templateUrl: "confirm-dialog.html",
    styleUrl: "confirm-dialog.css",
    standalone: true,
    imports: [ FormsModule, MatFormFieldModule, MatButtonModule ]
})
export class ConfirmDialogComponent {
    public static readonly DEFAULT_HEIGHT: string = "8rem";
    public static readonly DEFAULT_WIDTH: string = "24rem";

    promptLabel: string = "";

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public prompt: string,
    ) {}

    public ngOnInit(): void {
        if (this.prompt) {
            this.promptLabel = this.prompt;
        }
    }

    onCancel() {
        this.dialogRef.close(false);
    }

    onContinue() {
        this.dialogRef.close(true);
    }

    onKeypress(event: KeyboardEvent) {
        if (event.key === "Enter") {
            this.dialogRef.close(true);
        } 
    }
}