import { Component, inject } from "@angular/core";
import { Router, RouterLink } from '@angular/router';


@Component({
    selector: "app-footer",
    standalone: true,
    imports: [RouterLink],
    templateUrl: "./footer.component.html",
    styleUrls: ["./footer.component.css"],
})
export class FooterComponent {
    private readonly router = inject(Router);

    showFooter(): boolean {
        const url = this.router.url;
        return !url.includes('/dashboard') && !url.includes('/analyses');
    }
}