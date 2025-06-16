import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from "@angular/core";
import { FilesComponentsFile } from "../../../model/secret";
import { SecretFile } from "./secret-file";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { KeyEntryDialogService } from "../../../service/key-entry-dialog-serive";
import { SecretFileClient } from "../../../client/secret-file-client";

const PLACEHOLDER_CHAR: string = "•";

@Component({
    selector: "secret-file",
    templateUrl: "secret-file.html",
    styleUrl: "secret-file.css",
    imports: [ MatButtonModule, MatIconModule]
})
export class SecretFileComponent {

    private secretFileClient: SecretFileClient = inject(SecretFileClient);
    private keyEntryDialogService: KeyEntryDialogService = inject(KeyEntryDialogService);

    @Input() file: SecretFile;
    @Input() isSecretUnlocked: boolean;
    @Input() keyId: string;
    @Input() keyName: string;

    @Output() fileDeleted: EventEmitter<void> = new EventEmitter<void>();
    @Output() downloadFile: EventEmitter<SecretFile> = new EventEmitter<SecretFile>();

    fileName: string;

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty("file") || changes.hasOwnProperty("isSecretUnlocked")) {
            if (this.isSecretUnlocked) {
                this.fileName = this.file.fileName;
            } else { 
                this.fileName = (new Array(this.file.fileName.length + 1)).join(PLACEHOLDER_CHAR);
            }
        }
    }

    downloadFileClick(): void {
        if (this.file.fileId) {
            this.downloadFile.emit(this.file);
        }
    }

    deleteFileClick(): void {
        this.fileDeleted.emit();
    }
}