import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxLightRaysComponent } from "@omnedia/ngx-light-rays";

@Component({
    selector: 'landing-page',
    templateUrl: './landingpage.component.html',
    imports: [CommonModule, RouterModule, NgxLightRaysComponent],
})

export class LandingPageComponent {

}
