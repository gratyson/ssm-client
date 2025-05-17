import { Component, Input } from "@angular/core";

@Component({
    selector: "error-msg",
    templateUrl: "error-msg.html",
    styleUrl: "error-msg.css",
    imports: []
})
export class ErrorMsgComponent {

    @Input() message: string = "";
    @Input() type: "error" | "warn" = "error";

}