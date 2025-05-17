import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CdkCopyToClipboard, Clipboard, ClipboardModule } from "@angular/cdk/clipboard"; 
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { KeyEntryDialogComponent } from "../../../dialog/key-entry-dialog/key-entry-dialog.component";
import { EMPTY_SECRET, EMPTY_SECRET_COMPONENT, Secret, SecretComponent, SecretInput, WebsitePasswordComponents, WebsitePasswordComponentsInput } from "../../../model/secret";
import { SecretClient } from "../../../client/secret-client";
import { EncryptionService } from "../../../encryption/encryption-service";
import { Observable, map, of } from "rxjs";
import { DIRECT_LOCK_KEY_ID } from "../../../model/key";
import { SecretTypeBaseComponent, SecretTypeContextOption } from "../secret-type-base";
import { SecretFieldComponent } from "../../fields/secret-input/secret-input.component";
import { SecretPasswordComponent } from "../../fields/secret-password/secret-password.component";
import { GeneratePasswordDialogComponent } from "../../../dialog/generate-password-dialog/generate-password-dialog.component";
import { environment } from "../../../../environments/environment";

const GENERATE_PASSWORD_CONTEXT_OPTION: SecretTypeContextOption = { id: "generate_password", display: "Generate random password"};

@Component({
    selector: "website-password-edit",
    templateUrl: "website-password-edit.html",
    styleUrl: "website-password-edit.css",
    imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ClipboardModule, SecretFieldComponent, SecretPasswordComponent, ClipboardModule]
})
export class WebsitePasswordEditComponent extends SecretTypeBaseComponent {

    private secretClient: SecretClient = inject(SecretClient);
    private encryptionService: EncryptionService = inject(EncryptionService);

    constructor(private snackBar: MatSnackBar, 
                private clipboard: Clipboard,
                private dialog: MatDialog) {
                    super();
                }

    @Output() websiteChange: EventEmitter<string> = new EventEmitter<string>();

    secret: Secret;

    website: string = "";
    keyName: string = "";

    encryptedUsername: SecretComponent;
    encryptedPassword: SecretComponent;

    unEncryptedUsername: string = "";
    unEncryptedPassword: string = "";

    decryptionErrorMsg: string = "";

    isSecretUnlocked: boolean = false;

    viewPassword: boolean = false;
    viewPasswordIcon = "visibility"

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty("secretId")) {
            if (this.secretId) {
                this.secretClient.getWebsitePasswordSecretData(this.secretId).subscribe((secretResponse) => {
                    if (secretResponse?.success && secretResponse?.secret) {
                        this.setWebsitePasswordComponents(secretResponse.secret);
                    }
                });
            } else {
                this.setWebsitePasswordComponents(EMPTY_SECRET);
            }
        }
    }

    unlockSecret(): void {
        const prompt: string = this.keyName ? `Enter key password for "${this.keyName}" to unlock` : "Enter key password to unlock";

        const dialogRef: MatDialogRef<KeyEntryDialogComponent, string> = this.dialog.open(KeyEntryDialogComponent, {
            data: prompt, 
            height: KeyEntryDialogComponent.DEFAULT_HEIGHT,
            width: KeyEntryDialogComponent.DEFAULT_WIDTH,
            disableClose: true,
            autoFocus: true,
        });

        dialogRef.afterClosed().subscribe(keyPassword => {
            this.decryptionErrorMsg = "";

            if (keyPassword) {
                if (this.secret.key?.type?.id && this.secret.key.type.id === DIRECT_LOCK_KEY_ID)
                    this.unlockDirectLockSecret(keyPassword);
                else {
                    this.secretClient.unlockWebsitePasswordSecret({ secretId: this.secretId, keyPassword: keyPassword }).subscribe((secretResponse) => {
                        if (secretResponse?.success && secretResponse?.secret) {
                            this.setWebsitePasswordComponents(secretResponse.secret);
                            this.isSecretUnlocked = true;
                        } else if (secretResponse?.errorMsg) {
                            this.decryptionErrorMsg = secretResponse.errorMsg;
                        } else {
                            this.decryptionErrorMsg = "Failed to unlock secret";
                        }
                    });
                }
            }
        });
    }

    unlockDirectLockSecret(keyPassword: string): void {
        const salt = this.secret.key?.salt ? this.secret.key.salt : "";

        this.decryptComponent(this.encryptedUsername, keyPassword, salt).subscribe((usernameResult) => {
            if (usernameResult.error) {
                this.decryptionErrorMsg = usernameResult.error;
            } else {
                this.decryptComponent(this.encryptedPassword, keyPassword, salt).subscribe((passwordResult) => { 
                    if (passwordResult.error) {
                        this.decryptionErrorMsg = passwordResult.error;
                    } else {
                        this.unEncryptedUsername = usernameResult.decryptedText;
                        this.unEncryptedPassword = passwordResult.decryptedText;
                        this.isSecretUnlocked = true;
                    }
                });
            }
        });
    }

    onWebsiteChange(): void {
        this.websiteChange.emit(this.website);
    }

    override appendSecretComponents(secret: SecretInput): SecretInput {
        let secretInputWithComponents = secret;

        if (this.isSecretUnlocked) {
            secretInputWithComponents.websitePasswordComponents = {
                website: { 
                    id: this.secret.websitePasswordComponents?.website?.id ? this.secret.websitePasswordComponents.website.id : "",
                    value: this.website
                },
                username: { 
                    id: this.secret.websitePasswordComponents?.username?.id ? this.secret.websitePasswordComponents.username.id : "",
                    value: this.unEncryptedUsername
                },
                password: { 
                    id: this.secret.websitePasswordComponents?.password?.id ? this.secret.websitePasswordComponents.password.id : "",
                    value: this.unEncryptedPassword
                }
            }
        } else {
            secretInputWithComponents.websitePasswordComponents = {
                website: { 
                    id: this.secret.websitePasswordComponents?.website?.id ? this.secret.websitePasswordComponents.website.id : "",
                    value: this.website
                },
                username: null,
                password: null
            }
        }
        
        return secretInputWithComponents;
    }

    override saveRequiresKeyPassword(): boolean {
        return (this.isSecretUnlocked && (!!this.unEncryptedUsername || !!this.unEncryptedPassword));
    }

    override contextOptions(): SecretTypeContextOption[] {
        return [GENERATE_PASSWORD_CONTEXT_OPTION];
    }

    override onContextOptionSelect(contextOptionId: string): void {
        if(contextOptionId === GENERATE_PASSWORD_CONTEXT_OPTION.id) {
            const dialogRef: MatDialogRef<GeneratePasswordDialogComponent, string> = this.dialog.open(GeneratePasswordDialogComponent, {
                height: GeneratePasswordDialogComponent.DEFAULT_HEIGHT,
                width: GeneratePasswordDialogComponent.DEFAULT_WIDTH,
                disableClose: true,
                autoFocus: true,
            });

            dialogRef.afterClosed().subscribe((password) => {
                if (password) {
                    if (this.isSecretUnlocked && !this.unEncryptedPassword) {
                        this.unEncryptedPassword = password;
                    } 

                    this.clipboard.copy(password);
                    this.snackBar.open(`Generated password copied to clipboard`, "Close", { duration: environment.COPY_MESSAGE_DURATION_MS });
                }
            });
        }
    }

    private setWebsitePasswordComponents(secret: Secret) {
        this.secret = secret;
        this.decryptionErrorMsg = "";

        if (secret?.websitePasswordComponents) {
            this.setWebsite(secret.websitePasswordComponents.website?.value ? secret.websitePasswordComponents.website.value : "");
            this.encryptedUsername = secret.websitePasswordComponents.username ? secret.websitePasswordComponents.username : EMPTY_SECRET_COMPONENT;
            this.encryptedPassword = secret.websitePasswordComponents.password ? secret.websitePasswordComponents.password : EMPTY_SECRET_COMPONENT;
            this.unEncryptedUsername = this.getFieldValue(this.encryptedUsername);
            this.unEncryptedPassword = this.getFieldValue(this.encryptedPassword);

            this.isSecretUnlocked = this.encryptedUsername.value || this.encryptedPassword.value ? false : true;
        } else {
            this.setWebsite("");
            this.encryptedUsername = EMPTY_SECRET_COMPONENT;
            this.encryptedPassword = EMPTY_SECRET_COMPONENT;
            this.unEncryptedUsername = ""
            this.unEncryptedPassword = "";
            this.isSecretUnlocked = true;
        }
    }

    private setWebsite(website: string): void {
        if (this.website !== website) {
            this.website = website;
            this.websiteChange.emit(website);
        }
    }

    private decryptComponent(secretComponent: SecretComponent, key: string, salt: string): Observable<{ decryptedText: string, error: string}> {
        if (secretComponent && secretComponent.value) {
            if (secretComponent.encrypted && secretComponent.encryptionAlgorithm && secretComponent.id) {
                return this.encryptionService.decryptSecret(secretComponent.value, key, secretComponent.id, salt, secretComponent.encryptionAlgorithm).pipe(map((result) => {
                    if (result.success) {
                        return { decryptedText: result.decryptedText, error: "" };
                    }
                    return { decryptedText: "", error: "Failed to decrypt text" };
                }));
            } else if (secretComponent.encrypted) {
                return of({ decryptedText: "", error: "Unable to decrypt due to data integrity issue" });
            } 

            return of({ decryptedText: secretComponent.value, error: "" });
        }

        return of({ decryptedText: "", error: "" });
    }
}