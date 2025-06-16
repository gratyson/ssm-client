import { Component, ElementRef, inject, Input, SimpleChanges, ViewChild } from "@angular/core";
import { EMPTY_SECRET, FilesComponentsFile, FilesComponentsFileInput, Secret, SecretInput } from "../../../model/secret";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { SecretClient } from "../../../client/secret-client";
import { KeyEntryDialogService } from "../../../service/key-entry-dialog-serive";
import { BeforeSaveResult, NO_ACTION_BEFORE_SAVE_RESULT, SecretTypeBaseComponent } from "../secret-type-base";
import { ErrorMsgComponent } from "../../fields/error-msg/error-msg.component";
import { SecretFile } from "../../fields/secret-file/secret-file";
import { SecretFileComponent } from "../../fields/secret-file/secret-file.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../../environments/environment";
import { forkJoin, map, Observable, of } from "rxjs";
import { SaveSecretFileResponse, SecretFileClient } from "../../../client/secret-file-client";
import { abort } from "process";

const VALIDATE_MESSAGE_DURATION_MS: number = 3000;

@Component({
    selector: "files-edit",
    templateUrl: "files-edit.html",
    styleUrl: "files-edit.css",
    imports: [ MatButtonModule, MatIconModule, ErrorMsgComponent, SecretFileComponent ]
})
export class FilesEditComponent extends SecretTypeBaseComponent {
 
    private secretClient: SecretClient = inject(SecretClient);
    private secretFileClient: SecretFileClient = inject(SecretFileClient);
    private keyEntryDialogService: KeyEntryDialogService = inject(KeyEntryDialogService);

    constructor(private snackBar: MatSnackBar) {
        super();
    }

    @ViewChild("fileUpload") fileUploadInputElement: ElementRef;
    @ViewChild("downloadAnchor") downloadAnchor: ElementRef;

    secret: Secret;

    secretFiles: SecretFile[] = [];

    errorMsg: string = "";

    isSecretUnlocked: boolean = false;

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty("secretId")) {
            this.loadSecret();
        }
    }

    unlockSecret(): void {
        this.keyEntryDialogService.showUnlockDialog(this.secret.key?.name).subscribe((keyPassword) => {
            if (keyPassword) {
                this.errorMsg = "";

                this.secretClient.unlockFilesSecret({ secretId: this.secretId, keyPassword: keyPassword }).subscribe((response) => {
                    if (response?.success && response?.secret) {
                        this.setFilesComponents(response.secret);
                    } else {
                        this.errorMsg = "Unable to unlock secret. " + response?.errorMsg;
                    }
                });
            }
        });
    }

    setFilesComponents(secret: Secret): void {
        let hasEncryptedComponent = false;
        
        this.secretFiles = [];
        if(secret?.filesComponents?.files) {
            for (let file of secret.filesComponents.files) {
                this.secretFiles.push({ 
                    fileId: this.getFieldValue(file.fileId), 
                    fileName: this.getFieldValue(file.fileName),
                    isNewFile: false,
                    file: null,
                });

                if (file.fileId?.encrypted || file.fileName?.encrypted) {
                    hasEncryptedComponent = true;
                }
            }
        }

        this.isSecretUnlocked = !hasEncryptedComponent;
        this.secret = secret;
    }

    onUploadFile(): void {
        if(this.isSecretUnlocked) {
            this.fileUploadInputElement.nativeElement.click();
        }
    }

    onFileSelected(event: Event): void {
        if (event != null && event.target != null) {
            const inputElement = event.target as HTMLInputElement;
            if (inputElement.files != null && inputElement.files.length > 0) {
                const file = inputElement.files[0];

                if (this.validateFile(file)) {
                    this.secretFiles.push({
                        fileId: "",
                        fileName: file.name,
                        isNewFile: true,
                        file: file
                    });
                }
            }
        }
    }

    onDownloadFile(file: SecretFile): void {
        this.errorMsg = "";

        if (this.secret.key && this.secret.key.id) {
            this.keyEntryDialogService.showUnlockDialog(this.secret.key?.name).subscribe((keyPassword) => {
                if (keyPassword) {
                    this.secretFileClient.loadFile(file.fileId, file.fileName, this.secret.key ? this.secret.key.id ? this.secret.key.id : "" : "", keyPassword).subscribe(result => {
                        if (result.success && result.file) {
                            const url: string = URL.createObjectURL(new File([result.file], file.fileName));
                            this.downloadAnchor.nativeElement.href = url;
                            this.downloadAnchor.nativeElement.download = file.fileName;
                            this.downloadAnchor.nativeElement.click();
                            
                            URL.revokeObjectURL(url);
                            this.downloadAnchor.nativeElement.href = "#";
                        } else {
                            this.errorMsg = result.errorMsg;
                        }
                    });
                }
            });
        }   
    }

    onFileDeleted(index: number): void {
        this.errorMsg = "";

        this.secretFiles.splice(index, 1); 
    }

    override saveRequiresKeyPassword(): boolean {
        // Files cannot be modified, only created or deleted
        if (this.isSecretUnlocked) {
            if (this.secret && this.secret.filesComponents && this.secret.filesComponents.files && this.secret.filesComponents.files.length !== this.secretFiles.length) {
                return true;
            } 
            if ((!this.secret || !this.secret.filesComponents) && this.secretFiles.length > 0) {
                return true;
            }

            // Check for new files in case an equal number were created and deleted
            for (var secretFile of this.secretFiles) {
                if (!secretFile.fileId) {
                    return true;
                }
            }
        }
        
        return false;
    }

    override appendSecretComponents(secretInput: SecretInput): SecretInput {
        let secretInputWithComponents = secretInput;

        let filesComponentsFiles: FilesComponentsFileInput[] = [];
        for (let index = 0; index < this.secretFiles.length; index++) {
            filesComponentsFiles.push({ 
                fileId: this.toComponentInput(this.secret?.filesComponents?.files ? this.secret.filesComponents.files[index]?.fileId : null, this.secretFiles[index].fileId), 
                fileName: this.toComponentInput(this.secret?.filesComponents?.files ? this.secret.filesComponents.files[index]?.fileName : null, this.secretFiles[index].fileName)
            });
        }

        secretInputWithComponents.filesComponents = { files: filesComponentsFiles };

        return secretInputWithComponents;
    }

    override beforeSave(secretToSave: SecretInput): Observable<BeforeSaveResult> {
        this.errorMsg = "";
        
        if (this.secretFiles.length === 0) {
            this.errorMsg = "No files attached to save";
            return of({ abortSave: true, errorMsg: "Unable to save empty secret", updatedSecret: null });
        }

        let saveResponses: Observable<{ line: number, response: SaveSecretFileResponse}>[] = this.generateSaveFileResponses(secretToSave);
        if (saveResponses.length === 0) {
            return of(NO_ACTION_BEFORE_SAVE_RESULT);
        }

        return forkJoin(saveResponses).pipe(map(results => {
            if (secretToSave.filesComponents?.files) {
                let linesToDelete: number[] = [];
                
                for(let result of results) {
                    if (result.response.success) {
                        secretToSave.filesComponents.files[result.line].fileId = this.toComponentInput(null, result.response.fileId);
                    } else {
                        // Delete lines after loop is complete to avoid affecting the successful saves
                        linesToDelete.push(result.line);
                    }
                }

                if (linesToDelete.length > 0) {
                    if (linesToDelete.length === results.length && linesToDelete.length === this.secretFiles.length) {   // No existing files, and all new saves failed
                        this.errorMsg = "Failed to save secret files";
                        return {
                            abortSave: true,
                            errorMsg: "Failed to save secret files",
                            updatedSecret: null
                        }
                    } else {
                        for (let index = linesToDelete.length - 1; index >= 0; index--) {    // reverse order since deleting the lines changes later indices
                            secretToSave.filesComponents.files.splice(index, 1);
                        }
                    }
                }
            }

            this.updateSecretFilesFromSecretInput(secretToSave);

            return {
                abortSave: false,
                errorMsg: "",
                updatedSecret: secretToSave
            };
        }));
    }

    private generateSaveFileResponses(secretToSave: SecretInput): Observable<{ line: number, response: SaveSecretFileResponse}>[] {
        let saveResponses: Observable<{ line: number, response: SaveSecretFileResponse}>[] = [];

        for (let index = 0; index < this.secretFiles.length; index++) {
            const secretFile: SecretFile = this.secretFiles[index];
            if (!secretFile.fileId && secretFile.file) {
                saveResponses.push( 
                    this.secretFileClient.saveFile(secretFile.fileName, secretToSave.keyId, secretToSave.keyPassword, secretFile.file)
                        .pipe(map(response => {
                            return { line: index, response: response };
                        })));
            }
        }

        return saveResponses;
    }

    private loadSecret(): void {
        if (this.secretId) {
            this.secretClient.getSecretFilesSecretData(this.secretId).subscribe((secretResponse) => {
                this.errorMsg = "";
                if (secretResponse?.success && secretResponse?.secret) {
                    this.setFilesComponents(secretResponse.secret);
                } else {
                    this.errorMsg = "Unable to load data. " + secretResponse?.errorMsg;
                }
            });
        } else {
            this.setFilesComponents(EMPTY_SECRET);
        }
    }

    private validateFile(file: File): boolean {
        var validationMsg = "";

        if (file.size === 0) {
            validationMsg += "File cannot be empty. ";
        }

        if (file.size > environment.MAX_SECRET_FILE_SIZE) {
            validationMsg += "File size excceds maximum allowed size. ";
        }

        for (var secretFile of this.secretFiles) {
            if (secretFile.fileName.localeCompare(file.name) === 0) {
                validationMsg += "Another file already exists with this name. ";
                break;
            }
        }

        if (validationMsg) {
            this.snackBar.open("Unable to upload file: " + validationMsg, "OK", { duration: VALIDATE_MESSAGE_DURATION_MS });
            return false;
        }

        return true;
    }

    private updateSecretFilesFromSecretInput(secretInput: SecretInput): void {
        let newSecretFiles: SecretFile[] = [];

        if (secretInput.filesComponents?.files) {
            for (let file of secretInput.filesComponents?.files) {
                newSecretFiles.push({ 
                    fileId: file.fileId?.value ? file.fileId.value : "", 
                    fileName: file.fileName?.value ? file.fileName.value : "", 
                    isNewFile: false, 
                    file: null 
                });
            }
        }

        this.secretFiles = newSecretFiles;
    }
}