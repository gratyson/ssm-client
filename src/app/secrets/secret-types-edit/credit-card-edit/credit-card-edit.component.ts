import { Component, SimpleChanges, inject } from "@angular/core";
import { SecretTypeBaseComponent } from "../secret-type-base";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ClipboardModule } from "@angular/cdk/clipboard";
import { SecretFieldComponent } from "../../fields/secret-input/secret-input.component";
import { SecretEditComponent } from "../../secret-edit/secret-edit.component";
import { CreditCardComponentsInput, EMPTY_SECRET, EMPTY_SECRET_COMPONENT, Secret, SecretComponent, SecretInput } from "../../../model/secret";
import { SecretClient } from "../../../client/secret-client";
import { ErrorMsgComponent } from "../../fields/error-msg/error-msg.component";
import { KeyEntryDialogService } from "../../../service/key-entry-dialog-serive";

@Component({
    selector: "credit-card-edit",
    templateUrl: "credit-card-edit.html",
    styleUrl: "credit-card-edit.css",
    standalone: true,
    imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ClipboardModule, SecretFieldComponent, SecretEditComponent, ErrorMsgComponent ]
})
export class CreditCardEditComponent extends SecretTypeBaseComponent {

    private secretClient: SecretClient = inject(SecretClient);
    private keyEntryDialogService: KeyEntryDialogService = inject(KeyEntryDialogService);

    secret: Secret;

    companyName: string = "";

    encryptedCreditCardNumber: string = "";
    encryptedExpirationMonth: string = "";
    encryptedExpirationYear: string = "";
    encryptedSecurityCode: string = "";

    unEncryptedCreditCardNumber: string = "";
    unEncryptedExpirationMonth: string = "";
    unEncryptedExpirationYear: string = "";
    unEncryptedSecurityCode: string = "";

    isSecretUnlocked: boolean = false;

    errorMsg: string = "";

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty("secretId")) {
            if (this.secretId) {
                this.secretClient.getCreditCardSecretData(this.secretId).subscribe((secretResponse) => {
                    this.errorMsg = "";
                    if (secretResponse?.success && secretResponse?.secret) {
                        this.setCreditCardComponents(secretResponse.secret);
                    } else {
                        this.errorMsg = "Unable to load data. " + secretResponse?.errorMsg;
                    }
                });
            } else {
                this.setCreditCardComponents(EMPTY_SECRET);
            }
        }
    }

    unlockSecret(): void {
        this.keyEntryDialogService.showUnlockDialog(this.secret.key?.name).subscribe((keyPassword) => {
            if (keyPassword) {
                this.errorMsg = "";

                this.secretClient.unlockCreditCardSecret({ secretId: this.secretId, keyPassword: keyPassword }).subscribe((response) => {
                    if (response?.success && response?.secret) {
                        this.setCreditCardComponents(response.secret);
                    } else {
                        this.errorMsg = "Unable to unlock secret. " + response?.errorMsg;
                    }
                });
            }
        });
    }

    override saveRequiresKeyPassword(): boolean {
        return this.isSecretUnlocked && (
            !!this.unEncryptedCreditCardNumber || 
            !!this.unEncryptedExpirationMonth ||
            !!this.unEncryptedExpirationYear ||
            !!this.unEncryptedSecurityCode);
    }

    override appendSecretComponents(secretInput: SecretInput): SecretInput {
        let secretInputWithComponents = secretInput;

        if (this.isSecretUnlocked) {
            secretInputWithComponents.creditCardComponents = {
                companyName: this.toComponentInput(this.secret.creditCardComponents?.companyName, this.companyName),
                cardNumber: this.toComponentInput(this.secret.creditCardComponents?.cardNumber, this.unEncryptedCreditCardNumber),
                expirationMonth: this.toComponentInput(this.secret.creditCardComponents?.expirationMonth, this.unEncryptedExpirationMonth),
                expirationYear: this.toComponentInput(this.secret.creditCardComponents?.expirationYear, this.unEncryptedExpirationYear),
                securityCode: this.toComponentInput(this.secret.creditCardComponents?.securityCode, this.unEncryptedSecurityCode),
            }
        } else {
            secretInputWithComponents.creditCardComponents = {
                companyName: this.toComponentInput(this.secret.creditCardComponents?.companyName, this.companyName),
                cardNumber: null,
                expirationMonth: null,
                expirationYear: null,
                securityCode: null
            }
        }

        return secretInputWithComponents;
    }

    private setCreditCardComponents(secret: Secret) {
        this.secret = secret;
        this.errorMsg = "";

        if (secret?.creditCardComponents) {
            this.companyName = secret.creditCardComponents.companyName?.value ? secret.creditCardComponents.companyName.value : "";

            this.unEncryptedCreditCardNumber = this.getFieldValue(secret.creditCardComponents.cardNumber);
            this.unEncryptedExpirationMonth = this.getFieldValue(secret.creditCardComponents.expirationMonth);
            this.unEncryptedExpirationYear = this.getFieldValue(secret.creditCardComponents.expirationYear);
            this.unEncryptedSecurityCode = this.getFieldValue(secret.creditCardComponents.securityCode);

            this.isSecretUnlocked = 
                !this.hasEncryptedFieldValue(secret.creditCardComponents.cardNumber) && 
                !this.hasEncryptedFieldValue(secret.creditCardComponents.expirationMonth) &&
                !this.hasEncryptedFieldValue(secret.creditCardComponents.expirationYear) &&
                !this.hasEncryptedFieldValue(secret.creditCardComponents.securityCode);
        } else {
            this.companyName = "";
            this.unEncryptedCreditCardNumber = "";
            this.unEncryptedExpirationMonth = "";
            this.unEncryptedExpirationYear = "";
            this.unEncryptedSecurityCode = "";
            this.isSecretUnlocked = true;
        }
    }
}