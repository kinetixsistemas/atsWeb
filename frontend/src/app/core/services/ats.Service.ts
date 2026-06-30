import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { AnalysisResponse } from '../interfaces/analysis.interface';
import { AtsExtractedData } from '../interfaces/ats.interface';

@Injectable({
  providedIn: 'root',
})
export class AtsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl ='/api/v1/cv-extractions';

  private headers(): HttpHeaders {
    const token = this.auth.getSessionToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  analyzeCv(file: File, jobDescription: string): Observable<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('job_description', jobDescription);
    return this.http.post<AnalysisResponse>(`${this.apiUrl}/analyze`, formData, { headers: this.headers() });
  }

  extractCvData(file: File): Observable<AtsExtractedData> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<AtsExtractedData>(`${this.apiUrl}/extract`, formData, { headers: this.headers() });
  }
}
