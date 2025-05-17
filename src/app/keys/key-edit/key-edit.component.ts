import { Component, Input, SimpleChange, SimpleChanges, ViewChild, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ActivatedRoute, Router } from "@angular/router";
import { Key, KeyType, SaveKeyInput, UpdateKeyInput } from "../../model/key";
import { KeyTypeService } from "../../service/key-type-service";
import { SsmImageComponent } from "../../image/ssm-image/ssm-image.component";
import { KeyClient } from "../../client/key-client";
import { environment } from "../../../environments/environment";
import { UpdateNotificationService } from "../../service/update-notification-service";
import { MatMenuModule } from "@angular/material/menu";
import { ConfirmDialogComponent } from "../../dialog/confirm-dialog/confirm-dialog.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ImageClient } from "../../client/image-client";
import { MatSnackBar } from "@angular/material/snack-bar";

const VIEW_PASSWORD_ICONS: { [k: number]: string } = { 1: "visibility_off", 0: "visibility" };  
const PASSWORD_PLACEHOLDER: string = "placeholder"
const SAVE_MESSAGE_DURATION_MS: number = 3000;

@Component({
    selector: "key-edit",
    templateUrl: "key-edit.html",
    styleUrl: "key-edit.css",
    imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, SsmImageComponent, MatMenuModule]
})
export class KeyEditComponent {
    
    private keyClient: KeyClient = inject(KeyClient);
    private keyTypeService: KeyTypeService = inject(KeyTypeService);
    private imageClient: ImageClient = inject(ImageClient);
    private updateNotificationService: UpdateNotificationService = inject(UpdateNotificationService);

    @ViewChild("keyImage") ssmImageComponent: SsmImageComponent;

    @Input("keyId") keyId: string = "";

    key: Key | null = null;
    keyName: string = "";
    keyComments: string = "";
    keyTypeId: string | null = "";
    keyImageName: string = "";

    defaultKeyImagePath: string = "";

    keyPassword: string = "";
    viewPassword: boolean = false;
    viewPasswordIcon = "visibility";

    warnMsg: string = "";
    errorMsg: string = "";

    keyTypes: KeyType[] = [];

    constructor(private router: Router, 
                private dialog: MatDialog,
                private snackBar: MatSnackBar) { }

    public ngOnInit(): void {
        this.defaultKeyImagePath = environment.DEFAULT_KEY_IMAGE_PATH;

        this.keyTypeService.getAllKeyTypes().subscribe((keyTypes) => {
            this.keyTypes = keyTypes;

            // Set a default type if creating a new key
            if (this.keyTypes && this.keyTypes.length > 0 && !this.keyId) {
                this.keyTypeId = this.keyTypes[0].id;
            }
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty("keyId")) {
            if (!this.keyId) {
                this.setKey(null);
            } else {
                this.keyClient.getOwnedKey(this.keyId).subscribe(key => this.setKey(key));
            }
        }
    }

    toggleKeyPasswordVisibility(): void {
        this.viewPassword = !this.viewPassword;
        this.viewPasswordIcon = VIEW_PASSWORD_ICONS[+this.viewPassword];
    }

    onSaveKey(): void {
        this.warnMsg = "";
        this.errorMsg = "";

        this.ssmImageComponent.saveSelectedImage().subscribe(result => {
            if (result && !result.success) {
                this.warnMsg = `Failed to save image: ${result.errorMsg}`;
            }

            if (this.viewPassword) {
                this.toggleKeyPasswordVisibility();
            }

            // this.keyImageName gets updated during the save image operation, deferring saving the
            // key itself until image save is complete to get the accurate image name
            if (!this.keyId) {
                this.saveNewKey();
            } else {
                this.updateKey();
            }
        });
    }

    deleteKey(): void {
        this.warnMsg = "";
        this.errorMsg = "";

        const dialogRef: MatDialogRef<ConfirmDialogComponent, string> = this.dialog.open(ConfirmDialogComponent, {
            data: "Key will be permanently deleted.", 
            height: ConfirmDialogComponent.DEFAULT_HEIGHT,
            width: ConfirmDialogComponent.DEFAULT_WIDTH,
            disableClose: true,
            autoFocus: true,
        });

        dialogRef.afterClosed().subscribe((continueSelected) => {
            if (continueSelected) {
                this.keyClient.deleteKey(this.keyId).subscribe((response) => {
                    if (!response.success) {
                        this.errorMsg = "Unable to delete key. " + response.errorMsg;
                    } else {
                        if (this.key?.imageName) {
                            this.imageClient.deleteImage(this.key.imageName).subscribe((result) => {
                                if (!result.success) {
                                    console.warn("Failed to delete image: " + result.errorMsg);
                                }
                            });
                        }
        
                        this.updateNotificationService.publishDeletedKey(this.keyId);
                        this.router.navigate([ "app/keys" ]);
                    }
                })
            }
        });
    }

    private saveNewKey(): void {
        const keyToSave: SaveKeyInput = {
            name: this.keyName,
            comments: this.keyComments,
            imageName: this.keyImageName,
            typeId: !this.keyId ? this.keyTypeId : null,
            keyPassword: !this.keyId ? this.keyPassword : null,
        };

        this.keyClient.saveNewKey(keyToSave).subscribe((result) => {
            if (!result || !result.success) {
                this.errorMsg = `Failed to save key: ${result?.errorMsg}`;
            } else if (result.key?.id) {
                this.keyId = result.key.id;
                this.setKey(result.key);
                this.updateNotificationService.publishUpdatedKey(result.key);
                this.snackBar.open("Key saved", "Close", { duration: SAVE_MESSAGE_DURATION_MS });
            }
        });
    }

    private updateKey(): void {
        const keyToUpdate: UpdateKeyInput = {
            id: this.keyId,
            name: this.keyName,
            comments: this.keyComments,
            imageName: this.keyImageName,
        };

        this.keyClient.updateKey(keyToUpdate).subscribe((result) => {
            if (!result || !result.success) {
                this.errorMsg = `Failed to update key: ${result?.errorMsg}`;
            } else if (result.key?.id) {
                this.keyId = result.key.id;
                this.setKey(result.key);
                this.updateNotificationService.publishUpdatedKey(result.key);
                this.snackBar.open("Key saved", "Close", { duration: SAVE_MESSAGE_DURATION_MS });
            }
        });
    }

    private setKey(key: Key | null): void {
        this.key = key;
        this.keyName = key?.name ? key.name : "";
        this.keyComments = key?.comments ? key.comments : "";
        this.keyTypeId = key?.type?.id ? key.type.id : this.keyTypes.length > 0 ? this.keyTypes[0].id : "";
        this.keyImageName = key?.imageName ? key.imageName : "";
        this.keyPassword = this.keyId ? PASSWORD_PLACEHOLDER : "";
    }
}