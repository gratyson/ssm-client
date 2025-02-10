import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild, inject } from "@angular/core";
import { ImageClient } from "../../client/image-client";
import { Observable, map, of } from "rxjs";
import { ImageSourceType, NAME_IMAGE_SOURCE_TYPE, PATH_IMAGE_SOURCE_TYPE, SaveImageResult } from "../../model/image";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { randomUUID } from "crypto";
import { UpdateNotificationService } from "../../service/update-notification-service";

@Component({
    selector: "ssm-image",
    templateUrl: "ssm-image.html",
    styleUrl: "ssm-image.css",
    standalone: true,
    imports: [ MatButtonModule, MatIconModule ]
})
export class SsmImageComponent {
    
    private updateNotificationService: UpdateNotificationService = inject(UpdateNotificationService);

    private imageClient: ImageClient = inject(ImageClient);

    @ViewChild("fileUpload") fileUploadInputElement: ElementRef;
    @ViewChild("imageElement") imageElement: HTMLImageElement;
    
    @Input() image: string = "";
    @Output() imageChange: EventEmitter<string> = new EventEmitter<string>();
    @Input() imageSourceType: ImageSourceType = NAME_IMAGE_SOURCE_TYPE;
    @Output() imageSourceTypeChange: EventEmitter<ImageSourceType> = new EventEmitter<ImageSourceType>();

    @Input() defaultImage: string = "";
    @Input() defaultImageSourceType: ImageSourceType = NAME_IMAGE_SOURCE_TYPE;
    @Input() canEditImage: boolean = false;

    keyImagePath: string = "";
    newImageFile: File | null = null;

    public ngOnInit(): void {
        this.updateNotificationService.updatedImagePath.subscribe(updatedImagePath => this.onImageUpdate(updatedImagePath));
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if(changes.hasOwnProperty("image")) {
            this.newImageFile = null;  // clear any new selected image if the primary image is overwritten
            this.keyImagePath = this.getImagePath();
        } else if (changes.hasOwnProperty("defaultImage")) {
            this.keyImagePath = this.getImagePath();
        }
    }

    public saveSelectedImage(): Observable<SaveImageResult | null> {
        if (this.newImageFile) {
            let newImageName = this.image;
            if (!newImageName || this.imageSourceType === PATH_IMAGE_SOURCE_TYPE) {
                newImageName = crypto.randomUUID();
            }

            return this.imageClient.saveImage(newImageName, this.newImageFile).pipe(map((result) => {
                if (result.success) {
                    if (newImageName !== this.image) {
                        this.setImageName(newImageName);
                    }
                    
                    this.keyImagePath = this.imageClient.getImagePath(this.image);
                    this.newImageFile = null;
                    this.notifyImageUpdate();
                }

                return result;
            }));
        } 

        return of({success: true, errorMsg: ""});        
    }

    public clearSelectedImage(): void {
        if (this.newImageFile !== null) {
            this.newImageFile = null;
            this.keyImagePath = this.getImagePath();
        }
    }

    public deleteImage(): Observable<SaveImageResult> {
        if (this.image && this.imageSourceType === NAME_IMAGE_SOURCE_TYPE) {
            return this.imageClient.deleteImage(this.image);
        } else {
            return of({ success: false, errorMsg: "No image to delete" });
        }
    }

    onImageClick(): void {
        if (this.canEditImage) {
            this.fileUploadInputElement.nativeElement.click();
        }
    }

    onFileSelected(event: Event): void {
        if (event != null && event.target != null) {
            const inputElement = event.target as HTMLInputElement;
            if (inputElement.files != null && inputElement.files.length > 0) {
                this.newImageFile = inputElement.files[0];
                this.keyImagePath = URL.createObjectURL(this.newImageFile);
            }
        }
    }

    onImageError(event: Event): void {
        if (this.defaultImage) {
            const defaultImagePath = this.getPath(this.defaultImage, this.defaultImageSourceType);
            if (this.keyImagePath !== defaultImagePath) {
                this.keyImagePath = defaultImagePath;
            }
        }
    }

    private setImageName(imageName: string): void {
        this.image = imageName;
        this.imageSourceType = NAME_IMAGE_SOURCE_TYPE;
        this.imageChange.emit(imageName);
        this.imageSourceTypeChange.emit(NAME_IMAGE_SOURCE_TYPE);
    }

    private getImagePath(): string {
        if (this.newImageFile) {
            return URL.createObjectURL(this.newImageFile); 
        } 

        let path = this.getPath(this.image, this.imageSourceType);
        if (!path) {
            path = this.getPath(this.defaultImage, this.defaultImageSourceType);
        }

        return path;
    }

    private getPath(image: string, sourceType: ImageSourceType): string {
        if (image) {
            if (sourceType === NAME_IMAGE_SOURCE_TYPE) {
                return this.imageClient.getImagePath(image);
            } else {
                return image;
            }
        }

        return "";
    }

    private notifyImageUpdate() {
        fetch(this.keyImagePath, { cache: 'reload', mode: 'no-cors', headers: { "Accept": "image/avif,image/webp,image/png,image/svg+xml,image/*" } }).then(unused => {
            this.updateNotificationService.publishUpdatedImagePath(this.keyImagePath);              
        });
    }

    private onImageUpdate(updatedImagePath: string) {
        if (this.removeDateQueryParam(this.keyImagePath) === updatedImagePath) {
            this.keyImagePath = updatedImagePath + "&date=" + new Date().toISOString()
            console.log(this.keyImagePath);
        }
    }

    private removeDateQueryParam(path: string): string {
        const queryParamStart = path.lastIndexOf("&date=");

        if (queryParamStart > 0) {
            return path.substring(0, queryParamStart);
        }

        return path;
    }
}