import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

const LOCKED_REPLACEMENT_CHAR = "•";

@Component({
    selector: "secret-input-area",
    templateUrl: "secret-input-area.html",
    styleUrl: "secret-input-area.css",
    imports: [FormsModule, MatFormFieldModule, MatInputModule]
})
export class SecretInputAreaComponent {

    @Input() fieldName: string = "";
    @Input() isSecretUnlocked: boolean = false;
    @Input() minRows: number = 4;
    @Input() maxRows: number = 0;
    @Input() maxLength: number = 0;

    @Input() value: string = "";
    @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

    private unmaskedValue: string = "";
    private isMasked: boolean

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty("value")) {
            this.isMasked = false;

            if (!this.isSecretUnlocked) {
                this.maskValue();
            }
        } else if (changes.hasOwnProperty("isSecretUnlocked")) { 
            if (this.isSecretUnlocked) {
                this.unmaskValue();
            } else {
                this.maskValue();
            }
        }
    }

    onValueChange(newValue: string): void {
        this.value = newValue;
        this.valueChange.emit(newValue);
    }

    private maskValue(): void {
        if (!this.isMasked) {
            this.unmaskedValue = this.value;
            this.value = (new Array(this.value.length + 1)).join(LOCKED_REPLACEMENT_CHAR);
            this.isMasked = true;
        }
    }

    private unmaskValue(): void {
        if (this.isMasked) {
            this.value = this.unmaskedValue;
            this.isMasked = false;
        }
    }
}