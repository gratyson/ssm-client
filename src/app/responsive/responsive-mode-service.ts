import { HostListener, Injectable, OnDestroy, OnInit, Renderer2, RendererFactory2 } from "@angular/core";
import { environment } from "../../environments/environment";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({providedIn: "root"})
export class ResponsiveModeService implements OnDestroy {
    
    private renderer: Renderer2;
    private resizeEventUnsubscriber: () => void;
    private loadEventUnsubscriber: () => void;

    private mode: ResponsiveMode | null = null;
    private modeSource: BehaviorSubject<ResponsiveMode> = new BehaviorSubject<ResponsiveMode>(ResponsiveMode.Desktop);
   
    constructor(private rendererFactory2: RendererFactory2) {
        this.renderer = rendererFactory2.createRenderer(null, null);
        this.resizeEventUnsubscriber = this.renderer.listen("window", "resize", (event) => this.onResize(event));
        this.loadEventUnsubscriber = this.renderer.listen("window", "DOMContentLoaded", (event) => this.onLoad(event));
    }

    public modeChange: Observable<ResponsiveMode> = this.modeSource.asObservable();
    
    public currentMode(): ResponsiveMode {
        if (this.mode === null) {
            return this.calculateCurrentMode(window);
        }

        return this.mode;
    }

    ngOnDestroy(): void {
        this.resizeEventUnsubscriber();
    }

    private onLoad(event: Event): void {
        this.calculateCurrentMode((event.currentTarget as Window));
        this.loadEventUnsubscriber();
    }

    private onResize(event: Event): void {
        this.calculateCurrentMode((event.currentTarget as Window));
    }

    private calculateCurrentMode(rendererWindow: Window): ResponsiveMode {
        let newMode: ResponsiveMode;
        
        if (rendererWindow.innerWidth < environment.MOBILE_WIDTH_BREAK_PX) {
            newMode = ResponsiveMode.Mobile;
        } else if (rendererWindow.innerWidth < environment.TABLET_WIDTH_BREAK_PX) {
            newMode = ResponsiveMode.Tablet;
        } else {
            newMode = ResponsiveMode.Desktop;
        }

        if (newMode !== this.mode) {
            console.log("Changing responsive mode: " + newMode);
            this.mode = newMode;
            this.modeSource.next(newMode);
        }

        return newMode;
    }
}

export enum ResponsiveMode {
    Mobile,
    Tablet,
    Desktop
}