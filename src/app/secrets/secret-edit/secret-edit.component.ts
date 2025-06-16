import { Component, Input, SimpleChanges, ViewChild, inject } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { ResponsiveMode, ResponsiveModeService } from "../../responsive/responsive-mode-service";
import { MatSelectModule } from "@angular/material/select";
import { WebsitePasswordEditComponent } from "../secret-types-edit/website-password-edit/website-password-edit.component";
import { MatDividerModule } from "@angular/material/divider";
import { MatButtonModule } from "@angular/material/button";
import { CREDIT_CARD_SECRET_TYPE_ID, EMPTY_SECRET, FILES_SECRET_TYPE_ID, Secret, SecretInput, SecretType, TEXT_BLOB_SECRET_TYPE_ID, WEBSITE_PASSWORD_SECRET_TYPE_ID } from "../../model/secret";
import { SecretClient } from "../../client/secret-client";
import { SecretTypeClient } from "../../client/secret-type-client";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { KeyClient } from "../../client/key-client";
import { Key } from "../../model/key";
import { SsmImageComponent } from "../../image/ssm-image/ssm-image.component";
import { environment } from "../../../environments/environment";
import { FaviconService } from "../../service/favicon-service";
import { ImageSourceType, NAME_IMAGE_SOURCE_TYPE, PATH_IMAGE_SOURCE_TYPE } from "../../model/image";
import { UpdateNotificationService } from "../../service/update-notification-service";
import { MatMenuModule } from "@angular/material/menu";
import { ImageClient } from "../../client/image-client";
import { Router } from "@angular/router";
import { KeyEntryDialogComponent } from "../../dialog/key-entry-dialog/key-entry-dialog.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../../dialog/confirm-dialog/confirm-dialog.component";
import { SecretTypeBaseComponent, SecretTypeContextOption } from "../secret-types-edit/secret-type-base";
import { CreditCardEditComponent } from "../secret-types-edit/credit-card-edit/credit-card-edit.component";
import { TextBlobEditComponent } from "../secret-types-edit/text-blob/text-blob-edit.component";
import { FilesEditComponent } from "../secret-types-edit/files-edit/files-edit.component";

const ACCOUNT_PASSWORD_KEY_ID: string = "0";
const ACCOUNT_PASSWORD_KEY_NAME: string = "(Account Password)";
const SAVE_MESSAGE_DURATION_MS: number = 3000;

@Component({
    selector: "secret-edit",
    templateUrl: "secret-edit.html",
    styleUrl: "secret-edit.css",
    imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDividerModule, WebsitePasswordEditComponent, MatButtonModule, MatIconModule, SsmImageComponent, MatMenuModule, CreditCardEditComponent, TextBlobEditComponent, FilesEditComponent]
})
export class SecretEditComponent {

    private secretClient: SecretClient = inject(SecretClient);
    private keyClient: KeyClient = inject(KeyClient);
    private secretTypeClient: SecretTypeClient = inject(SecretTypeClient);
    private responsiveModeService: ResponsiveModeService = inject(ResponsiveModeService);
    private faviconService: FaviconService = inject(FaviconService);
    private updateNotificationService: UpdateNotificationService = inject(UpdateNotificationService);
    private imageClient: ImageClient = inject(ImageClient);

    WEBSITE_PASSWORD_SECRET_TYPE_ID: string = WEBSITE_PASSWORD_SECRET_TYPE_ID;
    CREDIT_CARD_SECRET_TYPE_ID: string = CREDIT_CARD_SECRET_TYPE_ID;
    TEXT_BLOB_SECRET_TYPE_ID: string = TEXT_BLOB_SECRET_TYPE_ID;
    FILES_SECRET_TYPE_ID: string = FILES_SECRET_TYPE_ID;

    ACCOUNT_PASSWORD_KEY_ID: string = ACCOUNT_PASSWORD_KEY_ID;
    ACCOUNT_PASSWORD_KEY_NAME: string = ACCOUNT_PASSWORD_KEY_NAME;

    @ViewChild("secretImage") ssmImageComponent: SsmImageComponent;
    @ViewChild("websitePasswordEdit") websitePasswordEdit: WebsitePasswordEditComponent;
    @ViewChild("creditCardEdit") creditCardEdit: CreditCardEditComponent;
    @ViewChild("textBlobEdit") textBlobEdit: TextBlobEditComponent;
    @ViewChild("filesEdit") filesEdit: FilesEditComponent;

    @Input() secretId: string;

    secret: Secret = EMPTY_SECRET;
    secretName: string = "";
    secretComments: string = "";
    secretTypeId: string;
    keyId: string = ACCOUNT_PASSWORD_KEY_ID;

    image: string = "";
    imageSourceType: ImageSourceType = NAME_IMAGE_SOURCE_TYPE;

    defaultImagePath: string = "";

    mobileMode: boolean;
    secretTypes: SecretType[] = [];
    secretTypeContextOptions: SecretTypeContextOption[] = [];
    ownedKeys: Key[] = [];

    warnMsg: string = "";
    errorMsg: string = "";

    website: string = "";

    typeEditComponentByTypeId: { [k:string]: SecretTypeBaseComponent } = {};

    constructor(private snackBar: MatSnackBar,
                private router: Router, 
                private dialog: MatDialog) { }    

    public ngOnInit(): void {
        this.secret = EMPTY_SECRET;
        
        this.mobileMode = (this.responsiveModeService.currentMode() === ResponsiveMode.Mobile);
        this.responsiveModeService.modeChange.subscribe((mode) => this.onResponsiveModeChange(mode));
        
        this.secretTypeClient.getAllSecretTypes().subscribe((secretTypes) => this.secretTypes = secretTypes);
        this.keyClient.getAllOwnedKeys().subscribe((keys) => this.ownedKeys = keys);
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty("secretId")) {
            if (this.secretId) {
                this.secretClient.getGeneralSecretData(this.secretId).subscribe((secretResponse) => {
                    this.warnMsg = "";
                    this.errorMsg = "";

                    if (secretResponse?.success && secretResponse?.secret) {
                        this.setSecretFields(secretResponse.secret);
                        this.secretTypeContextOptions = this.typeEditComponentByTypeId[this.secretTypeId].contextOptions();
                    } else {
                        this.errorMsg = "Unable to load secret. " + secretResponse?.errorMsg;
                    }
                });
            } else {
                this.setSecretFields(EMPTY_SECRET);
            }
        }
    }

    public ngAfterViewInit(): void {
        this.websitePasswordEdit.websiteChange.subscribe((website) => this.onWebsiteChange(website));

        this.typeEditComponentByTypeId[WEBSITE_PASSWORD_SECRET_TYPE_ID] = this.websitePasswordEdit;
        this.typeEditComponentByTypeId[CREDIT_CARD_SECRET_TYPE_ID] = this.creditCardEdit;
        this.typeEditComponentByTypeId[TEXT_BLOB_SECRET_TYPE_ID] = this.textBlobEdit;
        this.typeEditComponentByTypeId[FILES_SECRET_TYPE_ID] = this.filesEdit;
    }

    onSaveSecret(): void {
        this.errorMsg = "";
        this.warnMsg = "";

        if (this.validateSecret() && this.typeEditComponentByTypeId[this.secretTypeId].validateSecretComponents()) {
            if (this.typeEditComponentByTypeId[this.secretTypeId].saveRequiresKeyPassword()) {
                const prompt: string = this.keyId && this.keyId !== ACCOUNT_PASSWORD_KEY_ID ? "Enter key password:" : "Enter account password:";

                const dialogRef: MatDialogRef<KeyEntryDialogComponent, string> = this.dialog.open(KeyEntryDialogComponent, {
                    data: prompt, 
                    height: KeyEntryDialogComponent.DEFAULT_HEIGHT,
                    width: KeyEntryDialogComponent.DEFAULT_WIDTH,
                    disableClose: true,
                    autoFocus: true,
                });
        
                dialogRef.afterClosed().subscribe((keyPassword) => {
                    if (keyPassword) {
                        this.saveSecret(keyPassword);
                    }
                });
            } else {
                this.saveSecret("");
            }
        }
    }

    onSecretTypeChange(secretTypeId: string) {
        this.defaultImagePath = this.getDefaultImagePath(secretTypeId);
        this.secretTypeContextOptions = this.typeEditComponentByTypeId[this.secretTypeId].contextOptions();
    }

    deleteSecret() {
        this.warnMsg = "";
        this.errorMsg = "";

        const dialogRef: MatDialogRef<ConfirmDialogComponent, string> = this.dialog.open(ConfirmDialogComponent, {
            data: "Secret will be permanently deleted.", 
            height: ConfirmDialogComponent.DEFAULT_HEIGHT,
            width: ConfirmDialogComponent.DEFAULT_WIDTH,
            disableClose: true,
            autoFocus: true,
        });

        dialogRef.afterClosed().subscribe((continueSelected) => {
            if (continueSelected) {
                this.secretClient.deleteSecret(this.secretId).subscribe((result) => {
                    if (!result?.success) {
                        this.errorMsg = result?.errorMsg ? result.errorMsg : "An error occurred";
                    } else {
                        if (this.secret.imageName) {
                            this.imageClient.deleteImage(this.secret.imageName).subscribe((result) => {
                                if (!result.success) {
                                    console.warn("Failed to delete image: " + result.errorMsg);
                                }
                            });
                        }
        
                        this.updateNotificationService.publishDeletedSecret(this.secretId);
                        this.router.navigate([ "app/secrets" ]);
                    }
                });
            }
        });       
    }

    onContextOption(contextOptionId: string): void {
        if (this.typeEditComponentByTypeId[this.secretTypeId]) {
            this.typeEditComponentByTypeId[this.secretTypeId].onContextOptionSelect(contextOptionId);
        }
    }

    private saveSecret(keyPassword: string) {
        this.ssmImageComponent.saveSelectedImage().subscribe(result => {
            if (!result?.success) {
                this.warnMsg = "Image not saved: " + (result ? result.errorMsg : "No response from server");
            }

            const secretToSave: SecretInput = this.getSecretInput(keyPassword);

            this.typeEditComponentByTypeId[this.secretTypeId].beforeSave(secretToSave).subscribe(result => {
                if (result.abortSave) {
                    this.snackBar.open("Unable to save secret: " + result.errorMsg, "OK", { duration: SAVE_MESSAGE_DURATION_MS });
                } else {
                    this.secretClient.saveSecret(secretToSave).subscribe((secretResponse) => {
                        this.warnMsg = "";
                        this.errorMsg = "";

                        if (secretResponse?.success && secretResponse?.secret) {
                            this.setSecretFields(secretResponse.secret);
                            this.router.navigate(["app/secrets", "edit"], { queryParams: { "secretId": secretResponse.secret.id }});
                            this.updateNotificationService.publishUpdatedSecret(secretResponse.secret);
                            this.snackBar.open("Secret saved", "Close", { duration: SAVE_MESSAGE_DURATION_MS });
                        } else {
                            this.errorMsg = "Unable to save secret. " + secretResponse?.errorMsg;
                        }
                    });
                }
            });


        });
    }

    private getSecretInput(keyPassword: string): SecretInput {
        const baseSecretInput: SecretInput = {
            id: this.secretId,
            imageName: this.image && this.imageSourceType === NAME_IMAGE_SOURCE_TYPE ? this.image : "",
            name: this.secretName,
            comments: this.secretComments,
            typeId: this.secretTypeId,
            keyId: this.keyId,
            keyPassword: keyPassword,

            websitePasswordComponents: null,
            creditCardComponents: null,
            textBlobComponents: null,
            filesComponents: null
        };

        return this.typeEditComponentByTypeId[this.secretTypeId].appendSecretComponents(baseSecretInput);
    }

    private setSecretFields(secret: Secret): void {
        this.secret = secret;
        this.secretId = secret.id;
        this.secretName = this.secret?.name ? this.secret.name : "";
        this.secretComments = this.secret?.comments ? this.secret.comments : "";
        this.secretTypeId = this.secret?.type?.id ? this.secret.type.id : "";
        this.keyId = this.secret?.key?.id ? this.secret.key.id : ACCOUNT_PASSWORD_KEY_ID;

        this.setImage(secret);
        this.defaultImagePath = this.getDefaultImagePath(this.secret?.type?.id);
    }

    private onResponsiveModeChange(mode: ResponsiveMode): void {
        this.mobileMode = (this.responsiveModeService.currentMode() === ResponsiveMode.Mobile);
    }

    private validateSecret(): boolean {
        let validationMsg = "";

        if (!this.secretName) {
            validationMsg += "Secret name is required. ";
        }
        if(!this.secretTypeId) {
            validationMsg += "Secret type is required. ";
        }

        if (validationMsg) {
            this.snackBar.open("Unable to save secret: " + validationMsg, "OK", { duration: SAVE_MESSAGE_DURATION_MS });
            return false;
        }

        return true;
    }

    private getDefaultImagePath(secretTypeId: string | null | undefined): string {
        if (secretTypeId) {
            return environment.SECRET_IMAGE_PATH_BY_TYPE[secretTypeId];
        }

        return environment.DEFAULT_SECRET_IMAGE_PATH;
    }

    private setImage(secret: Secret): void {
        if (secret.imageName) {
            this.image = secret.imageName;
            this.imageSourceType = NAME_IMAGE_SOURCE_TYPE;
        } else if (this.secretTypeId === WEBSITE_PASSWORD_SECRET_TYPE_ID && this.website) {
            const faviconPath = this.faviconService.getFaviconPath(this.website);
            if (faviconPath) {
                this.image = faviconPath;
                this.imageSourceType = PATH_IMAGE_SOURCE_TYPE;
            } else {
                this.image = "";
                this.imageSourceType = NAME_IMAGE_SOURCE_TYPE;
            }
        } else {
            this.image = "";
            this.imageSourceType = NAME_IMAGE_SOURCE_TYPE;
        }
    }

    private onWebsiteChange(website: string): void {
        if (this.website !== website) {
            this.website = website;
            this.setImage(this.secret);
        }
    }
}