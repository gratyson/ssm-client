import { Component, inject } from "@angular/core";
import { Secret,  WEBSITE_PASSWORD_SECRET_TYPE_ID } from "../../model/secret";
import { SecretClient } from "../../client/secret-client";
import { PopoutSidenavComponent } from "../../responsive/popout-sidenav/popout-sidenav.component";
import { PopoutSidenavEntry } from "../../responsive/popout-sidenav/popout-sidenav-entry";
import { environment } from "../../../environments/environment";
import { Router } from "@angular/router";
import { ImageClient } from "../../client/image-client";
import { FaviconService } from "../../service/favicon-service";
import { UpdateNotificationService } from "../../service/update-notification-service";

const SECRET_EDIT_PATH = "edit";
const SECRET_ID_QUERY_PARAM = "?secretId=";

@Component({
    selector: "secrets-manager",
    templateUrl: "secrets-manager.html",
    styleUrl: "secrets-manager.css",
    standalone: true,
    imports: [ PopoutSidenavComponent ]
})
export class SecretsManagerComponent {  

    private secretClient: SecretClient = inject(SecretClient);
    private imageClient: ImageClient = inject(ImageClient);
    private faviconService: FaviconService = inject(FaviconService);
    private updateNotificationService: UpdateNotificationService = inject(UpdateNotificationService);

    secretEntries: PopoutSidenavEntry[] = [];
    selectedIndex: number = -1;
    editSelected: boolean = false;

    constructor(private router: Router) { }

    public ngOnInit(): void {
        this.secretClient.getAllOwnedSecrets().subscribe((secretResponse) => { 
            if (secretResponse?.success && secretResponse?.secrets) {
                this.secretEntries = this.convertToPopoutSidenavEntries(secretResponse.secrets);
                this.selectSecretFromPath();
            }
        });

        this.updateNotificationService.updatedSecret.subscribe(secret => this.processUpdatedSecret(secret));
        this.updateNotificationService.deletedSecret.subscribe(secretId => this.processDeletedSecret(secretId));
    }

    onEntrySelected(index: number): void {
        if (this.selectedIndex !== index) {
            this.selectedIndex = index;
            
            if (this.selectedIndex >= 0) {
                this.router.navigate(["app/secrets", "edit"], { queryParams: { "secretId": this.secretEntries[index].id }});
            }
        }
    }

    onEditSelectedChange(editSelected: boolean): void {
        if (editSelected !== this.editSelected) {
            this.editSelected = editSelected;
        
            if (editSelected) {
                this.router.navigate(["app/secrets", "edit"]);
            }
        }
    }

    private processUpdatedSecret(secret: Secret): void {
        for (let index = 0; index < this.secretEntries.length; index++) {
            if (this.secretEntries[index].id === secret.id) {
                this.secretEntries[index] = this.convertToPopoutSidenavEntry(secret);
                return;
            }
        }

        this.secretEntries.push(this.convertToPopoutSidenavEntry(secret));
        this.selectedIndex = this.secretEntries.length - 1;
    }

    private processDeletedSecret(secretId: string): void {
        for (let index = 0; index < this.secretEntries.length; index++) {
            if (this.secretEntries[index].id === secretId) {
                this.selectedIndex = -1;
                this.secretEntries.splice(index, 1);
                break;
            }
        }
    }

    private selectSecretFromPath(): string {
        const navigationPath = this.router.url;

        const secretIdPathIndex = navigationPath.indexOf(SECRET_ID_QUERY_PARAM);
        if (secretIdPathIndex) {
            const secretId = navigationPath.substring(navigationPath.indexOf(SECRET_ID_QUERY_PARAM) + SECRET_ID_QUERY_PARAM.length);
            for(let index = 0; index < this.secretEntries.length; index++) {
                if(secretId === this.secretEntries[index].id) {
                    this.selectedIndex = index;
                    break;
                }
            }
        } else if (navigationPath.substring(navigationPath.length - SECRET_EDIT_PATH.length) === SECRET_EDIT_PATH) {
            this.editSelected = true;
        }

        return "";
    }

    private convertToPopoutSidenavEntries(secrets: Secret[]): PopoutSidenavEntry[] {
        let popoutEntries: PopoutSidenavEntry[] = []

        for(let secret of secrets) {
            popoutEntries.push(this.convertToPopoutSidenavEntry(secret));
        }

        return popoutEntries;
    }

    private convertToPopoutSidenavEntry(secret: Secret): PopoutSidenavEntry {
        return {
            id: secret.id,
            imageName: this.getImagePath(secret),
            fallbackImagePath: this.getFallbackImagePath(secret),
            name: secret.name ? secret.name : "",
            type: secret.type?.name ? secret.type.name : "",
            comments: secret.comments ? secret.comments : "",
        };
    }

    private getImagePath(secret: Secret): string {        
        if (secret.imageName) {
            return this.imageClient.getImagePath(secret.imageName);
        }

        if (secret.type?.id && secret.type.id == WEBSITE_PASSWORD_SECRET_TYPE_ID && secret.websitePasswordComponents?.website?.value) {
            return this.faviconService.getFaviconPath(secret.websitePasswordComponents.website.value);
        }

        return "";
    }
    
    private getFallbackImagePath(secret: Secret): string {
        if (secret.type?.id && environment.SECRET_IMAGE_PATH_BY_TYPE[secret.type.id]) {
            return environment.SECRET_IMAGE_PATH_BY_TYPE[secret.type.id];
        }

        return environment.DEFAULT_SECRET_IMAGE_PATH;
    }
}