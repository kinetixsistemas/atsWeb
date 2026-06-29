import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { Template } from '../../core/interfaces/ats.interface';

@Component({
  selector: 'plantillas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent],
  templateUrl: './plantillas-page.component.html',
  styleUrl: './plantillas-page.component.css',
})
export class PlantillasPageComponent {
  protected readonly selectedCategory = signal<string>('todas');
  protected readonly searchQuery = signal<string>('');

  protected readonly templates = signal<Template[]>([
    {
      id: 'executive-pro',
      name: 'Executive Pro',
      description: 'Plantilla premium para ejecutivos con formato limpio y profesional. Optimizada para ATS con secciones claras y jerarquía visual.',
      preview_url: '',
      category: 'executive',
      ats_optimized: true,
      popular: true,
      color_scheme: ['#1a365d', '#2b6cb0', '#e2e8f0'],
    },
    {
      id: 'modern-tech',
      name: 'Modern Tech',
      description: 'Diseño moderno ideal para perfiles tecnológicos. Incluye secciones de skills visuales y timeline de experiencia.',
      preview_url: '',
      category: 'modern',
      ats_optimized: true,
      popular: true,
      color_scheme: ['#0f172a', '#3b82f6', '#f8fafc'],
    },
    {
      id: 'creative-portfolio',
      name: 'Creative Portfolio',
      description: 'Perfecto para diseñadores y creativos. Combina estética visual con estructura ATS-friendly.',
      preview_url: '',
      category: 'creative',
      ats_optimized: false,
      popular: false,
      color_scheme: ['#7c3aed', '#ec4899', '#faf5ff'],
    },
    {
      id: 'professional-classic',
      name: 'Professional Classic',
      description: 'Plantilla clásica y atemporal. Formato tradicional que los ATS procesan sin problemas.',
      preview_url: '',
      category: 'professional',
      ats_optimized: true,
      popular: false,
      color_scheme: ['#1e293b', '#475569', '#f1f5f9'],
    },
    {
      id: 'minimal-clean',
      name: 'Minimal Clean',
      description: 'Diseño minimalista con mucho espacio en blanco. Ideal para perfiles que buscan transmitir claridad y orden.',
      preview_url: '',
      category: 'professional',
      ats_optimized: true,
      popular: false,
      color_scheme: ['#2d3748', '#4a5568', '#f7fafc'],
    },
    {
      id: 'startup-edge',
      name: 'Startup Edge',
      description: 'Para profesionales de startups y empresas innovadoras. Destaca logros y métricas con un diseño dinámico.',
      preview_url: '',
      category: 'modern',
      ats_optimized: true,
      popular: false,
      color_scheme: ['#064e3b', '#059669', '#ecfdf5'],
    },
  ]);

  protected readonly categories = signal([
    { id: 'todas', label: 'Todas', icon: 'grid_view' },
    { id: 'professional', label: 'Profesional', icon: 'work' },
    { id: 'modern', label: 'Moderno', icon: 'code' },
    { id: 'creative', label: 'Creativo', icon: 'palette' },
    { id: 'executive', label: 'Ejecutivo', icon: 'stars' },
  ]);

  protected readonly filteredTemplates = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const category = this.selectedCategory();
    return this.templates().filter(t => {
      const matchCategory = category === 'todas' || t.category === category;
      const matchSearch = !query || t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  });

  protected readonly popularTemplates = computed(() =>
    this.templates().filter(t => t.popular)
  );

  protected setCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
  }

  protected onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected onUseTemplate(template: Template): void {
    // TODO: Implement template selection - navigate to editor or open modal
    alert(`Plantilla "${template.name}" seleccionada. Redirigiendo al editor...`);
  }
}
