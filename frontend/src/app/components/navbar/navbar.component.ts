import { Component, inject } from "@angular/core";
import { RouterLink, Router } from '@angular/router';

@Component({
    selector: "app-navbar",
    imports: [RouterLink],
    standalone: true,
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {
    private readonly router = inject(Router);

    showNavbar(): boolean {
        const url = this.router.url;
        return !url.includes('/dashboard') && !url.includes('/analyses');
    }

    irASeccion(id: string) {
        if (this.router.url !== '/') {
            this.router.navigate(['/'], { fragment: id });
            return;
        }
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}