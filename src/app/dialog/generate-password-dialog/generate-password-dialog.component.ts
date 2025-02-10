import { Component, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

const DEFAULT_PASSWORD_LENGTH: string = "16";

const LOWER_CASE_CHARACTERS: string = "abcdefghijklmnopqrstuvwxyz";
const UPPER_CASE_CHARACTERS: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBER_CHARACTERS: string = "0123456789";
const COMMON_SYMBOLS: string = "!@#$%^&*()+-=,.";
const LESS_COMMON_SYMBOLS: string = "_`~[]{}|;:<>?";

@Component({
    selector: "generate-password-dialog",
    templateUrl: "generate-password-dialog.html",
    styleUrl: "generate-password-dialog.css",
    standalone: true,
    imports: [ FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule ],
})
export class GeneratePasswordDialogComponent {

    public static readonly DEFAULT_HEIGHT: string = "21rem";
    public static readonly DEFAULT_WIDTH: string = "24rem";

    length: string = DEFAULT_PASSWORD_LENGTH;

    useLowercase: boolean = true;
    useUppercase: boolean = true;
    useNumbers: boolean = true;
    useCommonSymbols: boolean = true;
    useLessCommonSymbols: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<GeneratePasswordDialogComponent, string>,
        @Inject(MAT_DIALOG_DATA) public prompt: string,
    ) {}

    onCancel(): void {
        this.dialogRef.close("");
    }

    onAccept(): void {
        this.dialogRef.close(this.generatePassword(+this.length, this.getCharsets()));
    }

    onKeypress(event: KeyboardEvent) {
        if (event.key === "Enter") {
            this.dialogRef.close(this.generatePassword(+this.length, this.getCharsets()));
        }
    }

    private generatePassword(passwordLength: number, charsets: string[]): string {
        if (!charsets || !passwordLength) {
            return "";
        }
        
        let passwordChars: string[] = [];

        // Make sure to get at least one character from every set
        for(let charset of charsets) {
            passwordChars.push(this.selectRandomChar(charset));
        }

        const fullCharSet = this.concatStrings(charsets);
        while(passwordChars.length < passwordLength) {
            passwordChars.push(this.selectRandomChar(fullCharSet));
        }

        return this.concatStrings(this.shuffle(passwordChars));
    }

    private selectRandomChar(charset: string): string {
        if (!charset) {
            return "";
        }

        return charset.charAt(Math.floor(Math.random() * charset.length));
    }

    private concatStrings(strings: string[]): string {
        let concat = "";
        for(let str of strings) { 
            concat += str;
        }

        return concat;
    }

    // Implementation of a Fisher–Yates shuffle 
    private shuffle(chars: string[]): string[] {
        let currentIndex = chars.length;

        while (currentIndex != 0) {
      
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          const temp: string = chars[currentIndex];
          chars[currentIndex] = chars[randomIndex];
          chars[randomIndex] = temp;
        }

        return chars;
    }

    private getCharsets(): string[] {
        let charsets: string[] = [];

        if (this.useLowercase) {
            charsets.push(LOWER_CASE_CHARACTERS);
        }
        if (this.useUppercase) {
            charsets.push(UPPER_CASE_CHARACTERS);
        }
        if (this.useNumbers) {
            charsets.push(NUMBER_CHARACTERS);
        }
        if (this.useCommonSymbols) {
            charsets.push(COMMON_SYMBOLS);
        }
        if (this.useLessCommonSymbols) {
            charsets.push(LESS_COMMON_SYMBOLS);
        }

        return charsets;
    }
}