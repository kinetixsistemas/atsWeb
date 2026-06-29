export interface AtsExtractedData {
  personal_info: {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  professional_summary: string;
  work_experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  ats_score: number;
  structure_issues: StructureIssue[];
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string[];
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  gpa?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiration?: string;
}

export interface Language {
  language: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

export interface StructureIssue {
  section: string;
  issue: string;
  severity: 'error' | 'warning' | 'info';
  recommendation: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  preview_url: string;
  category: 'professional' | 'modern' | 'creative' | 'executive';
  ats_optimized: boolean;
  popular: boolean;
  color_scheme: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  highlighted: boolean;
}
