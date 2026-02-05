export interface WorkerProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth?: string;
  age?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  national_id?: string;
  profile_photo_url?: string;
  bio?: string;
  city: string;
  district?: string;
  location_lat?: string;
  location_lng?: string;
  experience_years: number;
  education_level?: string;
  languages?: Record<string, any>;
  
  // Add these missing fields from your Django model
  email?: string;
  profession?: string; // This was missing!
  hourly_rate?: string; // From AdminWorker model
  additional_skills?: string; // From AdminWorker model
  phone?: string; // From AdminWorker user_phone field
  
  availability: 'available' | 'busy' | 'on_leave' | 'not_available' | 'part_time' | 'full_time';
  expected_salary_min?: number;
  expected_salary_max?: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  trust_score: number;
  rating_average: string;
  total_reviews: number;
  total_placements: number;
  subscription_tier: 'free' | 'premium' | 'enterprise';
  subscription_expires_at?: string;
  skills: WorkerSkill[];
  documents: WorkerDocument[];
  references: WorkerReference[];
  created_at: string;
  updated_at: string;
}

export interface WorkerSkill {
  id: string;
  category: string;
  category_name: string;
  skill_name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience?: number;
  is_primary: boolean;
  created_at: string;
}

export interface WorkerDocument {
  id: string;
  document_type: 'national_id' | 'passport' | 'driving_license' | 'certificate' | 'diploma' | 'degree' | 'resume' | 'portfolio' | 'other';
  file_url: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  uploaded_at: string;
}

export interface WorkerReference {
  id: string;
  referee_name: string;
  referee_phone: string;
  referee_email?: string;
  relationship?: string;
  company_name?: string;
  reference_letter_url?: string;
  is_verified: boolean;
  verified_at?: string;
  notes?: string;
  created_at: string;
}

export interface WorkersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WorkerProfile[];
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: 'worker' | 'employer' | 'admin' | 'superuser';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  profile?: string; // URL to profile
  created_at?: string;
  updated_at?: string;
}

// Employer types based on your Django models
export interface EmployerProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  company_name?: string;
  address?: string;
  city: string;
  district?: string;
  location_lat?: string;
  location_lng?: string;
  profile_photo_url?: string;
  id_number?: string;
  id_verified?: boolean;
  subscription_tier?: 'free' | 'premium' | 'enterprise';
  subscription_expires_at?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface RegisterWorkerRequest {
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  national_id: string;
  date_of_birth: string;
  city: string;
  gender?: string;
  profession: string;
  experience_years?: number;
  skills?: string[];
  availability?: string;
}

export interface RegisterEmployerRequest {
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  city: string;
  address?: string;
  company_name?: string;
}

// Job types
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  location: string;
  city: string;
  salary_min?: number;
  salary_max?: number;
  job_type: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'project_based';
  experience_level?: string;
  category?: string;
  number_of_positions: number;
  posted_by: string;
  status: 'active' | 'filled' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

// Payment types
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'payment' | 'withdrawal' | 'refund' | 'escrow';
  reference: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// types/index.ts (add to existing file)

// ============= AUTH TYPES =============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  tokens: {
    access: string;
    refresh: string;
  };
  user: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: () => boolean;
  api: any; // AxiosInstance type
}