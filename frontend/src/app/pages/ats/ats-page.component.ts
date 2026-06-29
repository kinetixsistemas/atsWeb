import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { AtsService } from '../../core/services/ats.Service';
import { AtsExtractedData, StructureIssue } from '../../core/interfaces/ats.interface';

type ExtractionStatus = 'idle' | 'processing' | 'completed' | 'error';

@Component({
  selector: 'ats-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SideNavComponent],
  templateUrl: './ats-page.component.html',
  styleUrl: './ats-page.component.css',
})
export class AtsPageComponent {
  private readonly atsService = inject(AtsService);

  protected readonly extractionStatus = signal<ExtractionStatus>('idle');
  protected readonly extractedData = signal<AtsExtractedData | null>(null);
  protected selectedFile = signal<File | null>(null);
  protected selectedFileName = computed(() => this.selectedFile()?.name || '');
  protected errorMessage = signal<string>('');

  protected readonly totalIssues = computed(() =>
    this.extractedData()?.structure_issues?.length ?? 0
  );

  protected readonly errorIssues = computed(() =>
    this.extractedData()?.structure_issues?.filter(i => i.severity === 'error') ?? []
  );

  protected readonly warningIssues = computed(() =>
    this.extractedData()?.structure_issues?.filter(i => i.severity === 'warning') ?? []
  );

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
      setTimeout(() => { input.value = ''; }, 100);
    }
  }

  protected onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.type) || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      this.selectedFile.set(file);
      this.extractionStatus.set('idle');
      this.extractedData.set(null);
      this.errorMessage.set('');
    } else {
      alert('Por favor, sube solo archivos PDF, DOC o DOCX.');
    }
  }

  protected onExtract(): void {
    const file = this.selectedFile();
    if (!file) {
      alert('Selecciona o arrastra un archivo CV primero.');
      return;
    }

    this.extractionStatus.set('processing');
    this.errorMessage.set('');

    this.atsService.extractCvData(file).subscribe({
      next: (response) => {
        this.extractedData.set(response as AtsExtractedData);
        this.extractionStatus.set('completed');
      },
      error: (err) => {
        console.error('Error extracting CV data:', err);
        this.errorMessage.set('Error al procesar el CV. Inténtalo de nuevo.');
        this.extractionStatus.set('error');
      },
    });
  }

  protected onReset(): void {
    this.extractionStatus.set('idle');
    this.extractedData.set(null);
    this.selectedFile.set(null);
    this.errorMessage.set('');
  }

  protected getSeverityIcon(severity: StructureIssue['severity']): string {
    switch (severity) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
    }
  }

  protected getSeverityColor(severity: StructureIssue['severity']): string {
    switch (severity) {
      case 'error': return 'text-error border-error/20 bg-error/5';
      case 'warning': return 'text-secondary border-secondary/20 bg-secondary/5';
      case 'info': return 'text-primary border-primary/20 bg-primary/5';
    }
  }
}
