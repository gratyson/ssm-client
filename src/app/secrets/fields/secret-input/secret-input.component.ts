import { ClipboardModule } from "@angular/cdk/clipboard";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../../environments/environment";

@Component({
    selector: "secret-input",
    templateUrl: "secret-input.html",
    styleUrl: "secret-input.css",
    standalone: true,
    imports: [ FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ClipboardModule ],
})
export class SecretFieldComponent {

    @Input() fieldName: string = "";
    @Input() isSecretUnlocked: boolean = false;
    @Input() maxlength: string | number | null = null;
    
    @Input() value: string = "";
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    constructor(private snackBar: MatSnackBar) { }

    onValueChange(newValue: string): void {
        this.value = newValue;
        this.valueChange.emit(newValue);
    }

    copyValue(): void {
        if (this.isSecretUnlocked && this.value) {
            this.snackBar.open(`${this.fieldName} copied to clipboard`, "Close", { duration: environment.COPY_MESSAGE_DURATION_MS })
        }
    }
}