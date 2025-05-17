import { Component, ViewChild, inject } from "@angular/core";
import { PopoutSidenavComponent } from "../../responsive/popout-sidenav/popout-sidenav.component";
import { PopoutSidenavEntry } from "../../responsive/popout-sidenav/popout-sidenav-entry";
import { Router } from "@angular/router";
import { ImageClient } from "../../client/image-client";
import { KeyClient } from "../../client/key-client";
import { Key } from "../../model/key";
import { environment } from "../../../environments/environment";
import { UpdateNotificationService } from "../../service/update-notification-service";

const KEY_ID_QUERY_PARAM = "?keyId=";

@Component({
    selector: "keys-manager",
    templateUrl: "keys-manager.html",
    styleUrl: "keys-manager.css",
    imports: [PopoutSidenavComponent]
})
export class KeysManagerComponent {

    @ViewChild("popoutSidenav") popoutSidenav: PopoutSidenavComponent;

    private imageClient: ImageClient = inject(ImageClient);
    private keyClient: KeyClient = inject(KeyClient);
    private updateNotificationService: UpdateNotificationService = inject(UpdateNotificationService);

    keyEntries: PopoutSidenavEntry[] = [];
    selectedIndex: number = -1;

    constructor(private router: Router) { }

    public ngOnInit(): void {
        const keyId = this.getKeyFromPath();
        this.keyClient.getAllOwnedKeys().subscribe((keys) => {
            this.keyEntries = this.convertToPopoutSidenavEntries(keys);
            this.selectKey(keyId);
        });

        this.updateNotificationService.updatedKey.subscribe(key => this.processUpdatedKey(key));
        this.updateNotificationService.deletedKey.subscribe(keyId => this.processDeletedKey(keyId));
    }

    onEntrySelected(index: number): void {
        if (this.selectedIndex !== index) {
            this.selectedIndex = index;
            if (index >= 0) {
                this.router.navigate(["app/keys", "edit"], { queryParams: { "keyId": this.keyEntries[index].id }});
            } else {
                this.router.navigate(["app/keys"]); 
            }
        }
    }

    onNewEntrySelected(): void {
        this.selectedIndex = -1;
        this.router.navigate(["app/keys", "edit"]);
    }

    private convertToPopoutSidenavEntries(keys: Key[]): PopoutSidenavEntry[] {
        let popoutSidenavEntries: PopoutSidenavEntry[] = [];

        for(let key of keys) {
            popoutSidenavEntries.push(this.convertToPopoutSidenavEntry(key));
        }

        return popoutSidenavEntries;
    }

    private convertToPopoutSidenavEntry(key: Key): PopoutSidenavEntry {
        return {
            id: key.id ? key.id : "",
            imageName: key.imageName ? this.imageClient.getImagePath(key.imageName) : "",
            fallbackImagePath: environment.DEFAULT_KEY_IMAGE_PATH,
            name: key.name ? key.name : "",
            type: key.type?.name ? key.type.name : "",
            comments: key.comments ? key.comments : ""
        };
    }

    private getKeyFromPath(): string {
        const navigationPath = this.router.url;

        const keyIdPathIndex = navigationPath.indexOf(KEY_ID_QUERY_PARAM);
        if (keyIdPathIndex) {
            return navigationPath.substring(navigationPath.indexOf(KEY_ID_QUERY_PARAM) + KEY_ID_QUERY_PARAM.length);
        }

        return "";
    }

    private selectKey(id: string): void { 
        if (id) {
            for(let index = 0; index < this.keyEntries.length; index++) {
                if(id === this.keyEntries[index].id) {
                    this.selectedIndex = index;
                    break;
                }
            }
        }
    }

    private processUpdatedKey(key: Key): void {
        for (let i = 0; i < this.keyEntries.length; i++) {
            if (this.keyEntries[i].id === key.id) {
                this.keyEntries[i] = this.convertToPopoutSidenavEntry(key);
                return;
            }
        }

        this.keyEntries.push(this.convertToPopoutSidenavEntry(key));
    }

    private processDeletedKey(keyId: string): void {
        for (let index = 0; index < this.keyEntries.length; index++) {
            if (this.keyEntries[index].id === keyId) {
                this.selectedIndex = -1;
                this.keyEntries.splice(index, 1);
            }
        }
    }
}