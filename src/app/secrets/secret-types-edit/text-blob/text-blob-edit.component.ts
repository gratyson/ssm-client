import { Component, SimpleChanges, inject } from "@angular/core";
import { SecretTypeBaseComponent } from "../secret-type-base";
import { EMPTY_SECRET, Secret, SecretInput } from "../../../model/secret";
import { SecretClient } from "../../../client/secret-client";
import { KeyEntryDialogService } from "../../../service/key-entry-dialog-serive";
import { ErrorMsgComponent } from "../../fields/error-msg/error-msg.component";
import { SecretInputAreaComponent } from "../../fields/secret-inputarea/secret-input-area.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

const MAX_ALLOWED_TEXT_LENGTH: number = 524288;  // Max length allowed in database is 1kb, allow .5kb of plain text to leave a margin for encryption

@Component({
    selector: "text-blob-edit",
    templateUrl: "text-blob-edit.html",
    styleUrl: "text-blob-edit.css",
    imports: [ErrorMsgComponent, SecretInputAreaComponent, MatButtonModule, MatIconModule]
})
export class TextBlobEditComponent extends SecretTypeBaseComponent {

    private secretClient: SecretClient = inject(SecretClient);
    private keyEntryDialogService: KeyEntryDialogService = inject(KeyEntryDialogService);

    MAX_ALLOWED_TEXT_LENGTH: number = MAX_ALLOWED_TEXT_LENGTH;

    secret: Secret;

    unencryptedTextBlob: string = "";

    isSecretUnlocked: boolean = false;

    errorMsg: string = "";

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty("secretId")) {
            if (this.secretId) {
                this.secretClient.getTextBlobSecretData(this.secretId).subscribe((secretResponse) => {
                    this.errorMsg = "";
                    if (secretResponse?.success && secretResponse?.secret) {
                        this.setTextBlobComponents(secretResponse.secret);
                    } else {
                        this.errorMsg = "Unable to load data. " + secretResponse?.errorMsg;
                    }
                });
            } else {
                this.setTextBlobComponents(EMPTY_SECRET);
            }
        }
    }

    unlockSecret(): void {
        this.keyEntryDialogService.showUnlockDialog(this.secret.key?.name).subscribe((keyPassword) => {
            if (keyPassword) {
                this.errorMsg = "";

                this.secretClient.unlockTextBlobSecret({ secretId: this.secretId, keyPassword: keyPassword }).subscribe((response) => {
                    if (response?.success && response?.secret) {
                        this.setTextBlobComponents(response.secret);
                    } else {
                        this.errorMsg = "Unable to unlock secret. " + response?.errorMsg;
                    }
                });
            }
        });
    }

    override saveRequiresKeyPassword(): boolean {
        return this.isSecretUnlocked && !!this.unencryptedTextBlob; 
    }

    override appendSecretComponents(secretInput: SecretInput): SecretInput {
        let secretInputWithComponents = secretInput;

        if (this.isSecretUnlocked) {
            secretInputWithComponents.textBlobComponents = {
                textBlob: this.toComponentInput(this.secret.textBlobComponents?.textBlob, this.unencryptedTextBlob)
            }
        } else {
            secretInputWithComponents.textBlobComponents = {
                textBlob: null
            }
        }

        return secretInputWithComponents;
    }

    private setTextBlobComponents(secret: Secret) {
        this.secret = secret;
        this.errorMsg = "";

        if (secret?.textBlobComponents) {
            this.unencryptedTextBlob = this.getFieldValue(secret.textBlobComponents.textBlob);
            this.isSecretUnlocked = !this.hasEncryptedFieldValue(secret.textBlobComponents.textBlob);
        } else {
            this.unencryptedTextBlob = "";
            this.isSecretUnlocked = true;
        }
    }

}