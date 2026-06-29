export interface AnalysisResponse {
    match_percentage: number;
    missing_skills: string[];
    strengths: string[];
    recommendations: string;
}

export interface AnalysisDB {
    id: string;
    user_id: string;
    job_description: string;
    job_title?: string;
    company_name?: string;
    cv_filename: string;
    cv_text?: string;
    match_percentage: number;
    missing_skills: string[];
    strengths: string[];
    recommendations: string;
    status: string;
    created_at: string;
}

export interface HistoryResponse {
    analyses: AnalysisDB[];
    total: number;
}
