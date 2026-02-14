// hooks/useContracts.ts - COMPLETE FIXED VERSION
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import api from '@/lib/api';

// Types based on your Django Contract model
export interface ContractWorker {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  profile_photo_url?: string;
  profession?: string;
  hourly_rate?: number;
  rating_average?: number;
}

export interface ContractEmployer {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  company_name?: string;
  profile_photo_url?: string;
}

export interface Contract {
  id: string;
  employer: string;
  worker: string;
  category: string;
  category_name?: string;
  
  contract_type: 'full_time' | 'part_time' | 'temporary' | 'on_demand';
  status: 'draft' | 'trial' | 'active' | 'completed' | 'terminated' | 'cancelled';
  job_title: string;
  job_description: string;
  
  worker_salary_amount: number;
  service_fee_amount: number;
  total_monthly_cost: number;
  payment_frequency: string;
  
  start_date: string;
  trial_end_date: string | null;
  end_date: string | null;
  
  work_location: string | null;
  work_hours_per_week: number;
  work_schedule: Record<string, string>;
  
  is_trial: boolean;
  trial_duration_days: number;
  trial_passed: boolean | null;
  trial_feedback: string | null;
  
  contract_document_url: string | null;
  signed_by_employer: boolean;
  signed_by_worker: boolean;
  employer_signature_date: string | null;
  worker_signature_date: string | null;
  
  created_by: string | null;
  created_at: string;
  updated_at: string;
  activated_at: string | null;
  completed_at: string | null;
  
  termination_reason: string | null;
  
  // Additional fields from serializers
  worker_details?: ContractWorker;
  employer_details?: ContractEmployer;
  
  // Computed properties
  days_until_trial_end?: number;
  is_active_trial?: boolean;
  can_request_replacement?: boolean;
  work_schedule_display?: string;
}

export interface ContractReplacement {
  id: string;
  original_contract: string;
  original_worker: string | null;
  replacement_worker: string | null;
  new_contract: string | null;
  reason: string;
  requested_by: string | null;
  status: 'requested' | 'processing' | 'completed' | 'cancelled';
  is_free_replacement: boolean;
  replacement_fee: number;
  requested_at: string;
  completed_at: string | null;
  replacement_cost: number;
  
  // Additional fields
  original_worker_details?: ContractWorker;
  replacement_worker_details?: ContractWorker;
  requested_by_email?: string;
}

export interface ContractDocument {
  id: string;
  contract: string;
  document_type: 'contract' | 'amendment' | 'termination' | 'other';
  document_url: string;
  document_name: string;
  uploaded_by: string | null;
  uploaded_by_email?: string;
  uploaded_at: string;
  description: string | null;
  file_size_display?: string;
}

export interface ContractFilters {
  status?: string;
  contract_type?: string;
  is_trial?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function useContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [replacements, setReplacements] = useState<ContractReplacement[]>([]);
  const [documents, setDocuments] = useState<ContractDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });

  // Helper to build query string
  const buildQueryString = (filters?: ContractFilters): string => {
    if (!filters) return '';
    
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.contract_type) params.append('contract_type', filters.contract_type);
    if (filters.is_trial !== undefined) params.append('is_trial', String(filters.is_trial));
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.page_size) params.append('page_size', String(filters.page_size));
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  // Helper to validate contract ID
  const validateContractId = (contractId: string): boolean => {
    if (!contractId || contractId === 'undefined' || contractId === 'null') {
      console.error('Invalid contract ID:', contractId);
      return false;
    }
    return true;
  };

  /**
   * Fetch contracts with optional filters
   */
  const fetchContracts = useCallback(async (filters?: ContractFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryString(filters);
      const response = await api.get<PaginatedResponse<Contract>>(`/contracts/contracts/${queryString}`);
      
      setContracts(response.data.results || []);
      setPagination({
        count: response.data.count || 0,
        next: response.data.next || null,
        previous: response.data.previous || null
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Error fetching contracts:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch contracts';
      setError(errorMessage);
      
      // Don't show toast for 500 errors (backend issue) to avoid spamming
      if (err.response?.status !== 500) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single contract by ID - FIXED VERSION
   */
  const fetchContractById = useCallback(async (contractId: string) => {
    // 🔴 FIX: Validate contractId before making request
    if (!validateContractId(contractId)) {
      const error = new Error('Invalid contract ID');
      setError('Invalid contract ID');
      throw error;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Contract>(`/contracts/contracts/${contractId}/`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch contract';
      setError(errorMessage);
      
      if (err.response?.status !== 500) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new contract
   */
  const createContract = useCallback(async (contractData: Partial<Contract>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Contract>('/contracts/contracts/', contractData);
      setContracts(prev => [response.data, ...prev]);
      toast.success('Contract created successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error creating contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create contract';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a contract
   */
  const updateContract = useCallback(async (contractId: string, contractData: Partial<Contract>) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch<Contract>(`/contracts/contracts/${contractId}/`, contractData);
      setContracts(prev => prev.map(c => c.id === contractId ? response.data : c));
      toast.success('Contract updated successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error updating contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update contract';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a contract
   */
  const deleteContract = useCallback(async (contractId: string) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/contracts/contracts/${contractId}/`);
      setContracts(prev => prev.filter(c => c.id !== contractId));
      toast.success('Contract deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete contract';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign a contract
   */
  const signContract = useCallback(async (contractId: string, signatureData?: string) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a simple signature if not provided
      const signature = signatureData || `signed-${Date.now()}-${contractId.slice(0, 8)}`;
      
      const response = await api.post<Contract>(`/contracts/contracts/${contractId}/sign/`, {
        signature_data: signature,
        agreed_to_terms: true
      });
      
      setContracts(prev => prev.map(c => c.id === contractId ? response.data : c));
      toast.success('Contract signed successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error signing contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to sign contract';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate contract document
   */
  const generateContractDocument = useCallback(async (contractId: string) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<{ contract_document_url: string }>(
        `/contracts/contracts/${contractId}/generate_document/`
      );
      
      // Update contract with document URL
      setContracts(prev => prev.map(c => 
        c.id === contractId 
          ? { ...c, contract_document_url: response.data.contract_document_url } 
          : c
      ));
      
      toast.success('Contract document generated');
      return response.data.contract_document_url;
    } catch (err: any) {
      console.error('Error generating document:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate document';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get contract document URL
   */
  const getContractDocument = useCallback(async (contractId: string) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<{ document_url: string }>(
        `/contracts/contracts/${contractId}/document_url/`
      );
      return response.data.document_url;
    } catch (err: any) {
      console.error('Error getting document URL:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to get document';
      setError(errorMessage);
      
      if (err.response?.status !== 500) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Activate a contract
   */
  const activateContract = useCallback(async (contractId: string) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Contract>(`/contracts/contracts/${contractId}/activate/`);
      setContracts(prev => prev.map(c => c.id === contractId ? response.data : c));
      toast.success('Contract activated successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error activating contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to activate contract';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit trial feedback
   */
  const submitTrialFeedback = useCallback(async (
    contractId: string, 
    feedback: { feedback_text: string; performance_rating: number; will_continue: boolean }
  ) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Contract>(
        `/contracts/contracts/${contractId}/trial_feedback/`,
        feedback
      );
      
      setContracts(prev => prev.map(c => c.id === contractId ? response.data : c));
      toast.success('Feedback submitted successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to submit feedback';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Complete trial period
   */
  const completeTrial = useCallback(async (
    contractId: string,
    data: { feedback?: string; rating?: number; comment?: string }
  ) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<Contract>(
        `/contracts/contracts/${contractId}/complete_trial/`,
        data
      );
      
      setContracts(prev => prev.map(c => c.id === contractId ? response.data : c));
      toast.success('Trial completed successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error completing trial:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to complete trial';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Request worker replacement
   */
  const requestReplacement = useCallback(async (contractId: string, reason: string) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<{ replacement_id: string; is_free: boolean; suggestions: any[] }>(
        `/contracts/contracts/${contractId}/request_replacement/`,
        { reason }
      );
      
      toast.success('Replacement request submitted');
      return response.data;
    } catch (err: any) {
      console.error('Error requesting replacement:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to request replacement';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Terminate a contract
   */
  const terminateContract = useCallback(async (
    contractId: string, 
    reason?: string, 
    termination_date?: string
  ) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload: any = {
        reason: reason || 'Contract terminated by user'
      };
      
      if (termination_date) {
        payload.termination_date = termination_date;
      }
      
      const response = await api.post<Contract>(
        `/contracts/contracts/${contractId}/terminate/`,
        payload
      );
      
      setContracts(prev => prev.map(c => c.id === contractId ? response.data : c));
      toast.success('Contract terminated');
      return response.data;
    } catch (err: any) {
      console.error('Error terminating contract:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to terminate contract';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get active contracts
   */
  const getActiveContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PaginatedResponse<Contract>>('/contracts/contracts/active/');
      setContracts(response.data.results || []);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching active contracts:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch active contracts';
      setError(errorMessage);
      
      if (err.response?.status !== 500) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get contract history
   */
  const getContractHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PaginatedResponse<Contract>>('/contracts/contracts/history/');
      setContracts(response.data.results || []);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching contract history:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch contract history';
      setError(errorMessage);
      
      if (err.response?.status !== 500) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============= REPLACEMENTS =============

  /**
   * Fetch replacements
   */
  const fetchReplacements = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PaginatedResponse<ContractReplacement>>('/contracts/replacements/');
      setReplacements(response.data.results || []);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching replacements:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch replacements';
      setError(errorMessage);
      
      if (err.response?.status !== 500) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approve replacement
   */
  const approveReplacement = useCallback(async (replacementId: string, replacementWorkerId: string) => {
    if (!validateContractId(replacementId)) {
      throw new Error('Invalid replacement ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<{ new_contract_id: string; replacement_status: string }>(
        `/contracts/replacements/${replacementId}/approve_replacement/`,
        { replacement_worker_id: replacementWorkerId }
      );
      
      toast.success('Replacement approved');
      return response.data;
    } catch (err: any) {
      console.error('Error approving replacement:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to approve replacement';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============= DOCUMENTS =============

  /**
   * Fetch contract documents
   */
  const fetchContractDocuments = useCallback(async (contractId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = contractId 
        ? `/contracts/documents/?contract=${contractId}`
        : '/contracts/documents/';
      
      const response = await api.get<PaginatedResponse<ContractDocument>>(url);
      setDocuments(response.data.results || []);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch documents';
      setError(errorMessage);
      
      if (err.response?.status !== 500) {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload contract document
   */
  const uploadContractDocument = useCallback(async (
    contractId: string,
    file: File,
    documentType: string,
    description?: string
  ) => {
    if (!validateContractId(contractId)) {
      throw new Error('Invalid contract ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('contract', contractId);
      formData.append('document_type', documentType);
      formData.append('document_name', file.name);
      formData.append('document_file', file);
      if (description) formData.append('description', description);
      
      const response = await api.post<ContractDocument>('/contracts/documents/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setDocuments(prev => [response.data, ...prev]);
      toast.success('Document uploaded successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error uploading document:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to upload document';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete contract document
   */
  const deleteContractDocument = useCallback(async (documentId: string) => {
    if (!validateContractId(documentId)) {
      throw new Error('Invalid document ID');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/contracts/documents/${documentId}/`);
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast.success('Document deleted');
      return true;
    } catch (err: any) {
      console.error('Error deleting document:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete document';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    contracts,
    replacements,
    documents,
    loading,
    error,
    pagination,
    
    // Contract CRUD
    fetchContracts,
    fetchContractById,
    createContract,
    updateContract,
    deleteContract,
    
    // Contract Actions
    signContract,
    generateContractDocument,
    getContractDocument,
    activateContract,
    submitTrialFeedback,
    completeTrial,
    requestReplacement,
    terminateContract,
    getActiveContracts,
    getContractHistory,
    
    // Replacements
    fetchReplacements,
    approveReplacement,
    
    // Documents
    fetchContractDocuments,
    uploadContractDocument,
    deleteContractDocument,
  };
}