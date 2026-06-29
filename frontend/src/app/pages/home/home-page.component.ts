import { Component, ElementRef, OnDestroy, Renderer2, afterNextRender, viewChild, Inject, PLATFORM_ID } from '@angular/core';
import { ThreeBackgroundComponent } from '../../components/three-background/three-background.component';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

interface BentoFeature {
    icon: string;
    title: string;
    description: string;
    badge?: string;
    colSpan: string;
    tags?: string[];
    hasProgress?: boolean;
    hasImages?: boolean;
}

@Component({
    selector: 'app-landing-home',
    standalone: true,
    imports: [ThreeBackgroundComponent, RouterLink],
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.css'
})

export class HomePageComponent implements OnDestroy {

    private observer: IntersectionObserver | null = null;

    // Manejo seguro del DOM usando señales de vista (ViewChild Signals)
    protected readonly glowTop = viewChild<ElementRef<HTMLDivElement>>('glowTop');
    protected readonly glowBottom = viewChild<ElementRef<HTMLDivElement>>('glowBottom');


    private unlistenMouseMove: (() => void) | null = null;

    // Estructura de datos limpia para el Bento Grid de características
    protected readonly features: BentoFeature[] = [
        {
            icon: 'troubleshoot',
            title: 'Análisis Inteligente',
            description: 'Escaneo profundo de palabras clave y entidades que mapea automáticamente tus habilidades con los requisitos específicos de la oferta de trabajo.',
            colSpan: 'md:col-span-8',
            tags: ['NLP Parsing', 'JSON Export', 'Match Logic', 'Cloud Sync']
        },
        {
            icon: 'speed',
            title: 'Feedback en Tiempo Real',
            description: 'Feedback instantáneo sobre compatibilidad mientras editas. Ajusta el tono y la densidad de palabras clave al instante.',
            colSpan: 'md:col-span-4',
            hasProgress: true
        },
        {
            icon: 'dashboard_customize',
            title: 'Plantillas Profesionales',
            description: 'Diseños optimizados para legibilidad de máquinas. Estructuras probadas que garantizan que los datos se extraigan correctamente en cualquier sistema.',
            colSpan: 'md:col-span-12',
            hasImages: true
        }
    ];

    constructor(private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: Object) {
        // afterNextRender garantiza que window y document solo se ejecuten en el navegador (Evita errores de SSR)
        afterNextRender(() => {
            this.initGlowInteraction();
            this.initScrollReveal();
        });
    }

    private initScrollReveal(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        this.observer?.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        document.querySelectorAll('.scroll-reveal').forEach((el) => {
            this.observer?.observe(el);
        });
    }

    private initGlowInteraction(): void {
        this.unlistenMouseMove = this.renderer.listen('window', 'mousemove', (event: MouseEvent) => {
            const x = event.clientX / window.innerWidth;
            const y = event.clientY / window.innerHeight;

            const targets = [this.glowTop(), this.glowBottom()]

            targets.forEach((glowSignal, index) => {
                if (glowSignal) {
                    const speed = (index + 1) * 20;
                    this.renderer.setStyle(
                        glowSignal.nativeElement,
                        'transform',
                        `translate(${x * speed}px, ${y * speed}px)`
                    );
                }
            });
        });
    }


    ngOnDestroy(): void {
        // Limpieza de listeners para evitar fugas de memoria
        if (isPlatformBrowser(this.platformId)) {
            if (this.unlistenMouseMove) {
                this.unlistenMouseMove();
            }
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    }
}

