// types/dashboard.ts
export interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: 'worker' | 'employer' | 'admin' | 'super_admin';
  phone_verified: boolean;
  profile_completed?: boolean;
  avatar_url?: string;
}

export interface Document {
  id: string;
  document_type: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  uploaded_at: string;
  verified_at?: string;
  document_url?: string;
}

export interface Contract {
  id: string;
  job_title: string;
  status: 'draft' | 'trial' | 'active' | 'completed' | 'terminated';
  worker_salary_amount: number;
  start_date: string;
  end_date?: string;
  employer_name?: string;
  worker_name?: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduled_date: string;
  payment_method: string;
}

export interface Metric {
  label: string;
  value: number;
  change: number;
  icon: string;
}

export interface DashboardData {
  documents: Document[];
  contracts: Contract[];
  payments: Payment[];
  notifications: any[];
  metrics: any;
}