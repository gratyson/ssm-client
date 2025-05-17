import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SmHeader } from './home/components/header/sm-header.component';
import { SmHomeComponent } from './home/components/home/sm-home.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, SmHeader ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
}
