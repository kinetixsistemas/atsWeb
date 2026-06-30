import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalysisResponse, HistoryResponse, AnalysisDB } from '../interfaces/analysis.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1';

  analyzeWithFile(
    jobDescription: string,
    file: File,
    jobTitle?: string,
    companyName?: string
  ): Observable<AnalysisResponse> {
    const formData = new FormData();
    formData.append('job_description', jobDescription);
    formData.append('file', file, file.name);
    if (jobTitle) formData.append('job_title', jobTitle);
    if (companyName) formData.append('company_name', companyName);

    return this.http.post<AnalysisResponse>(`${this.apiUrl}/analyze-file`, formData);
  }

  getHistory(limit = 20, offset = 0): Observable<HistoryResponse> {
    return this.http.get<HistoryResponse>(
      `${this.apiUrl}/analyses/history?limit=${limit}&offset=${offset}`
    );
  }

  getAnalysis(id: string): Observable<AnalysisDB> {
    return this.http.get<AnalysisDB>(`${this.apiUrl}/analyses/${id}`);
  }
}
