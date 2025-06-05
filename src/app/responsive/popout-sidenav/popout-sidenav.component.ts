import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild, inject } from "@angular/core";
import { PopoutSidenavEntry } from "./popout-sidenav-entry";
import { MatSidenav, MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatRippleModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ResponsiveMode, ResponsiveModeService } from "../responsive-mode-service";
import { Router, RouterOutlet } from "@angular/router";
import { SsmImageComponent } from "../../image/ssm-image/ssm-image.component";
import { debounceTime, Observable, Subject } from "rxjs";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { KeyValuePipe } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";

const DEBOUNCE_TIME_MS: number = 500;

@Component({
    selector: "popout-sidenav",
    templateUrl: "popout-sidenav.html",
    styleUrl: "popout-sidenav.css",
    imports: [ MatSidenavModule, MatListModule, MatRippleModule, MatIconModule, MatButtonModule, RouterOutlet, SsmImageComponent, FormsModule, MatFormFieldModule, MatInputModule, KeyValuePipe, MatCheckboxModule ],
})
export class PopoutSidenavComponent {
 
    private responsiveModeService: ResponsiveModeService = inject(ResponsiveModeService);

    @Input() entries: PopoutSidenavEntry[] = [];

    @Input() selectedEntry: number = -1;
    @Output() selectedEntryChange: EventEmitter<number> = new EventEmitter<number>();

    @Input() editSelected: boolean = false;
    @Output() editSelectedChange: EventEmitter<boolean> = new EventEmitter<boolean>()

    @Output() newEntrySelected: EventEmitter<void> = new EventEmitter<void>();

    sideNavFixedTopGap: number = 0;
    isMobileMode: boolean;

    filterValue: string = "";
    filterResult: Observable<void>;
    showTypes: { [k:string] : boolean } = {};
    showTypeResult: Observable<void>;
    subject: Subject<void> = new Subject<void>();

    entryFiltered: boolean[] = [];
    showTypeFilter: boolean = false;
    typeFilterApplied: boolean = false;
    typeFilterClass: string = "vertical-close-no-animation";   // avoid showing the closing animation on inital page load

    @ViewChild("snav") sideNav: MatSidenav;
    @ViewChild("sidenavDiv") sidenavDiv: ElementRef;
    @ViewChild("sidenavFilter") sidenavFilter: ElementRef;

    constructor(private router: Router) { }

    public ngOnInit(): void {
        this.filterResult = this.subject.pipe(debounceTime(DEBOUNCE_TIME_MS));
        this.filterResult.subscribe(value => this.onFilterUpdate());
    }

    public ngAfterViewInit(): void {
        setTimeout(() => {
            this.calculateSidenavTop();
            
            this.isMobileMode = this.responsiveModeService.currentMode() === ResponsiveMode.Mobile;
            this.responsiveModeService.modeChange.subscribe((mode) => this.onResponsiveModeChange(mode));

            if (this.selectedEntry < 0 || this.editSelected || !this.isMobileMode) {
                this.sideNav.toggle();
            }
        }, 0);
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty("selectedEntry") || changes.hasOwnProperty("editSelected")) {
            if (this.selectedEntry >= 0) {
                this.closeSideNav();
                this.setEditSelected(false);
            } else if (this.editSelected) {
                this.closeSideNav();
            } else {
                this.openSideNav();
            }
        }
        if (changes.hasOwnProperty("entries")) {
            this.applyFilters();
        }
    }

    onResponsiveModeChange(mode: ResponsiveMode): void {
        const newIsModeMobile = (mode === ResponsiveMode.Mobile);
        if (this.isMobileMode !== newIsModeMobile) {
            this.isMobileMode = newIsModeMobile;

            this.sideNavFixedTopGap = this.sidenavDiv.nativeElement.getBoundingClientRect().top;

            if (this.isMobileMode) {
                if ((this.selectedEntry < 0 && !this.editSelected) !== this.sideNav.opened) {  // in mobile mode, side nav is only open when no entry is currently selected
                    this.sideNav.toggle();
                }
            } else if (!this.sideNav.opened) {   // side nav is always open in desktop mode
                this.sideNav.toggle();
            }
        }

        setTimeout(() => {
            this.calculateSidenavTop();
        }, 0);
    }

    onCreateNew(): void {
        this.closeSideNav();
        this.setEditSelected(true);
        this.newEntrySelected.emit();
    }

    onEntrySelect(index: number): void {
        this.closeSideNav();
        this.setSelectedEntry(index);  
    }

    onBackButtonClicked(): void {
        this.openSideNav();
    }

    onImageError(entry: PopoutSidenavEntry, event: Event): void {
        if (event && event.target) {
            const imgElement = event.target as HTMLImageElement;

            if (imgElement.src !== entry.fallbackImagePath) {
                imgElement.src = entry.fallbackImagePath;
            }
        }
    }

    onFilterKeyup(event: Event): void {
        this.subject.next();
    }

    onFilterType(event: Event): void {
        this.subject.next();
    }

    onShowTypeFilter(): void {
        this.showTypeFilter = !this.showTypeFilter;
        this.typeFilterClass = this.showTypeFilter ? "vertical-open" : "vertical-close";
    }

    private closeSideNav(): void {
        if (this.isMobileMode && this.sideNav?.opened) {
            this.sideNav.toggle();
        }
    }

    private openSideNav(): void {
        if (this.sideNav && !this.sideNav.opened) {
            this.sideNav.toggle();
        }
    }

    private setSelectedEntry(selectedEntry: number): void {
        if (this.selectedEntry !== selectedEntry) {
            this.selectedEntry = selectedEntry;
            this.selectedEntryChange.emit(selectedEntry);   

            if (this.selectedEntry >= 0 && this.editSelected) {
                this.editSelected = false;
                this.editSelectedChange.emit(false);
            }
        }
    }

    private setEditSelected(editSelected: boolean): void {
        if (this.editSelected !== editSelected) {
            this.editSelected = editSelected;
            this.editSelectedChange.emit(editSelected);

            if (editSelected && this.selectedEntry >= 0) {
                this.selectedEntry = -1;
                this.selectedEntryChange.emit(-1);   
            }
        }
    }

    private calculateSidenavTop(): void {
        if(this.sideNav) {
            setTimeout(() => {
                this.sideNavFixedTopGap = this.sidenavDiv.nativeElement.getBoundingClientRect().top;
            }, 0);
        }
    }

    private onFilterUpdate(): void { 
        this.filterValue = (this.sidenavFilter.nativeElement.value as string).toLocaleLowerCase();
        this.applyFilters();
    }

    private applyFilters(): void {
        this.entryFiltered = [];
        this.typeFilterApplied = false;

        this.entries.forEach(entry => {
            if (!this.showTypes.hasOwnProperty(entry.type)) {
                this.showTypes[entry.type] = true;
            } else if (!this.showTypes[entry.type]) {
                this.typeFilterApplied = true;
            }

            this.entryFiltered.push(((this.filterValue !== "" && !entry.name.toLocaleLowerCase().startsWith(this.filterValue)))
                                        || (!this.showTypes[entry.type]));
        })
    }
}