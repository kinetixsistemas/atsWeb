import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AnalysisService } from '../../core/services/analysis.service';
import { AnalysisResponse } from '../../core/interfaces/analysis.interface';
import { SideNavComponent } from "../../components/side-nav/side-nav.component";

// Definimos los posibles estados del botón de análisis
type AnalysisStatus = 'idle' | 'processing' | 'completed';

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SideNavComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})

export class DashboardPageComponent {

  private readonly analysisServices = inject(AnalysisService);

  // Signals de Estado
  protected readonly jobDescription = signal<string>('');

  // Signal para manejar el estado del botón de análisis
  protected readonly analysisStatus = signal<AnalysisStatus>('idle');

  // signal para guardar la respuesta de la API
  protected readonly analysisResult = signal<AnalysisResponse | null>(null);

  // Signal para manejar el archivo
  protected selectedFile = signal<File | null>(null);

  // Signal computada para el conteo de caracteres (Reactividad pura)
  protected readonly charCount = computed(() => this.jobDescription().length);

  //  Signal computada para la alerta de caracteres excedidos
  protected readonly isCharLimitAlert = computed(() => this.charCount() > 3800);

  // Nombre del archivo calculado automáticamente
  protected readonly selectedFileName = computed(() => this.selectedFile()?.name || '');

  // --- Manejo del textarea ---
  protected onDescriptionChanges(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    let value = target.value;

    // Limitar a 4000 caracteres
    if (value.length > 4000) {
      value = value.substring(0, 4000);
      target.value = value; // Actualizamos el valor del textarea
    }
    this.jobDescription.set(value);
  }

  // Manejador para cuando hacen clic y seleccionan el archivo
  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Obtenemos el primer archivo
      this.processFile(input.files[0]);

      setTimeout(() => {
        input.value = '';
      }, 100);
    }
  }



  /**
   * Captura el archivo cuando el usuario lo suelta (drag and drop) en la zona designada
   */
  protected onFileDropped(event: DragEvent): void {
    // para que no se abra el archivo en el navegador
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  // Validación opcional de tipo de archivo por seguridad
  private processFile(file: File): void {
    const allowedExtensions = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (allowedExtensions.includes(file.type) || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      this.selectedFile.set(file);

      if (this.analysisStatus() === 'completed') {
        this.analysisStatus.set('idle');
      }
    } else {
      alert('Por favor, sube solo archivos PDF, DOC o DOCX.');
    }
  }


  // Manejador del cambio de texto en el textarea
  protected onInput(): void {
    // Si necesitas limitar el texto estrictamente a 4000 caracteres:
    if (this.jobDescription().length > 4000) {
      this.jobDescription.set(this.jobDescription().substring(0, 4000));
    }
  }

  // Lógica del botón de análisis con simulación de carga
  protected onAnalyze(): void {
    if (this.jobDescription().trim().length === 0) return;

    // 1. Cambiamos el estado a procesando (Inicia Spinner)
    this.analysisStatus.set('processing');
    // reseteanos resultados anteriores
    this.analysisResult.set(null);

    const fileToUpload = this.selectedFile();

    if (fileToUpload) {
      // 🚀 CASO REAL: El usuario subió un archivo, usamos el nuevo endpoint
      this.analysisServices.analyzeWithFile(this.jobDescription(), fileToUpload).subscribe({
        next: (response: AnalysisResponse) => {
          this.analysisResult.set(response);
          this.analysisStatus.set('completed');
          setTimeout(() => this.analysisStatus.set('idle'), 2000);
        },
        error: (err) => {
          console.error('Error al analizar el archivo', err);
          alert('Hubo un error al procesar tu archivo. Inténtalo de nuevo.');
          this.analysisStatus.set('idle');
        }
      });
    } else {
      // CASO ANTERIOR: Si no hay archivo, puedes mandar un aviso o usar tu texto fijo antiguo
      alert('Por favor, selecciona o arrastra un archivo CV (PDF) antes de analizar.');
      this.analysisStatus.set('idle');
    }
  }

  // Efecto Glow de las Bento Cards seguro para SSR (Sin window ni document global)
  protected onCardMouseMove(event: MouseEvent, cardElement: HTMLDivElement): void {
    const rect = cardElement.getBoundingClientRect();
    cardElement.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    cardElement.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  }
}