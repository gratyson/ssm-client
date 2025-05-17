import { Component, ElementRef, ViewChild, inject } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatTabGroup, MatTabsModule } from "@angular/material/tabs";
import { Router, RouterOutlet } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { MatRippleModule } from "@angular/material/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatSidenav, MatSidenavModule } from "@angular/material/sidenav";
import { ResponsiveMode, ResponsiveModeService } from "../../../responsive/responsive-mode-service";

@Component({
    selector: "sm-home",
    templateUrl: "sm-home.html",
    styleUrl: "sm-home.css",
    imports: [MatTabsModule, MatIconModule, MatFormFieldModule, MatRippleModule, MatDividerModule, RouterOutlet, MatSidenavModule, MatListModule]
})
export class SmHomeComponent {

    FEATURE_SELECT_OPTIONS = [
        { title: "My Secrets", abbr: "Secrets", nav: "/app/secrets", icon: environment.SECRET_MENU_ICON },
        { title: "My Keys", abbr: "Keys", nav: "/app/keys", icon: environment.KEY_MENU_ICON }
    ];

    private responsiveModeService: ResponsiveModeService = inject(ResponsiveModeService);

    @ViewChild("featureTab") tabGroup: MatTabGroup;
    @ViewChild("snav") sideNav: MatSidenav;
    @ViewChild("sidenavDiv") sidenavDiv: ElementRef;

    selectedFeature: number = -1;
    isDesktopMode: boolean;

    sideNavFixedTopGap: number = 0;
    
    constructor(private router: Router) { }

    public ngOnInit(): void { 
        const curRoute = this.router.url;

        this.selectedFeature = 0;
        for(let i = 0; i < this.FEATURE_SELECT_OPTIONS.length; i++) {
            if (curRoute.startsWith(this.FEATURE_SELECT_OPTIONS[i].nav)) {
                this.selectedFeature = i;
                break;
            }
        }

        this.responsiveModeService.modeChange.subscribe((mode) => this.onResponsiveModeChange(mode));
    }

    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.selectFeature(this.selectedFeature);

            this.calculateSidenavTop();

            this.isDesktopMode = this.responsiveModeService.currentMode() === ResponsiveMode.Desktop;
            if (this.isDesktopMode) {
                this.openFeatureSidenav();
            }
        }, 0);

    }

    onFeatureSelect(featureIndex: number) {
        this.selectFeature(featureIndex);
        this.navigateToFeature(featureIndex);
    }

    private onResponsiveModeChange(mode: ResponsiveMode) {
        this.isDesktopMode = mode === ResponsiveMode.Desktop;

        if (this.isDesktopMode) {
            this.openFeatureSidenav();
        } else {
            this.closeFeatureSidenav();
        }

        this.calculateSidenavTop();
    }

    private openFeatureSidenav(): void {
        if (this.sideNav && !this.sideNav.opened) {
            this.sideNav.toggle();
        }
    }

    private closeFeatureSidenav(): void {
        if (this.sideNav && this.sideNav.opened) {
            this.sideNav.toggle();
        }
    }
    
    private selectFeature(featureIndex: number) {  
        if (this.selectedFeature !== featureIndex) {
            this.selectedFeature = featureIndex;

            if (this.tabGroup) {
                this.tabGroup.selectedIndex = featureIndex;
            }
        }
    }

    private navigateToFeature(featureIndex: number) {
        this.router.navigate([this.FEATURE_SELECT_OPTIONS[featureIndex].nav]);
    }
    
    private calculateSidenavTop(): void {
        setTimeout(() => {
            this.sideNavFixedTopGap = this.sidenavDiv.nativeElement.getBoundingClientRect().top;
        }, 0);
    }
}