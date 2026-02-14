// hooks/useInvoices.ts - FULLY FIXED WITH CORRECT ENDPOINTS
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import api from '@/lib/api';

// ============= TYPES =============

export interface PayrollCycle {
  id: string;
  month: number;
  year: number;
  total_contracts: number;
  total_worker_salaries: number;
  total_service_fees: number;
  total_revenue: number;
  invoices_generated: boolean;
  payments_processed: boolean;
  cycle_closed: boolean;
  invoice_generation_date: string | null;
  payment_processing_date: string | null;
  closed_at: string | null;
  created_at: string;
  cycle_name: string;
}

export interface EmployerInvoice {
  id: string;
  invoice_number: string;
  payroll_cycle: string;
  contract: string;
  employer: string;
  
  worker_salary_amount: number;
  service_fee_amount: number;
  additional_fees: number;
  total_amount: number;
  
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_date: string | null;
  payment_method: string | null;
  transaction_reference: string | null;
  
  invoice_pdf_url: string | null;
  
  created_at: string;
  updated_at: string;
  
  is_overdue?: boolean;
  employer_name?: string;
  employer_company?: string;
  contract_title?: string;
  worker_name?: string;
  cycle_name?: string;
}

export interface WorkerPayment {
  id: string;
  payment_reference: string;
  payroll_cycle: string;
  contract: string;
  worker: string;
  invoice: string;
  
  salary_amount: number;
  deductions: number;
  net_amount: number;
  
  payment_method: string;
  payment_provider: string | null;
  account_number: string;
  account_name: string | null;
  
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transaction_id: string | null;
  transaction_receipt_url: string | null;
  
  payslip_pdf_url: string | null;
  
  scheduled_date: string;
  disbursement_date: string | null;
  created_at: string;
  updated_at: string;
  
  failure_reason: string | null;
  retry_count: number;
  
  worker_name?: string;
  worker_phone?: string;
  contract_title?: string;
}

export interface WorkerPaymentMethod {
  id: string;
  worker: string;
  method_type: 'mobile_money_mtn' | 'mobile_money_airtel' | 'bank_transfer' | 'cash_pickup';
  provider_name: string | null;
  account_number: string;
  account_name: string | null;
  bank_name: string | null;
  branch_name: string | null;
  swift_code: string | null;
  is_default: boolean;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  transaction_type: 'employer_payment' | 'worker_disbursement' | 'refund';
  external_reference: string;
  internal_reference: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider: string;
  status: 'initiated' | 'pending' | 'successful' | 'failed' | 'cancelled';
  provider_status: string | null;
  provider_response: Record<string, any> | null;
  payer_user: string | null;
  payee_user: string | null;
  invoice: string | null;
  worker_payment: string | null;
  initiated_at: string;
  completed_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface InvoiceFilters {
  status?: string;
  payroll_cycle?: string;
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

// ============= MAIN HOOK =============

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<EmployerInvoice[]>([]);
  const [payrollCycles, setPayrollCycles] = useState<PayrollCycle[]>([]);
  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<WorkerPaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  });

  // ============= INVOICES =============
  // ✅ ENDPOINTS: /payments/invoices/, /payments/invoices/{id}/, /payments/invoices/{id}/pay/, /payments/invoices/{id}/download_pdf/
  // ✅ ENDPOINT: /payments/invoices/stats/

  const fetchInvoices = useCallback(async (filters?: InvoiceFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payroll_cycle) params.append('payroll_cycle', filters.payroll_cycle);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.ordering) params.append('ordering', filters.ordering);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get<PaginatedResponse<EmployerInvoice>>(`/payments/invoices/${queryString}`);
      
      setInvoices(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      });
      
      return response.data;
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.response?.data?.detail || 'Failed to fetch invoices');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvoiceById = useCallback(async (invoiceId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<EmployerInvoice>(`/payments/invoices/${invoiceId}/`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      setError(err.response?.data?.detail || 'Failed to fetch invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadInvoice = useCallback(async (invoiceId: string, format: 'pdf' | 'csv' = 'pdf') => {
    setLoading(true);
    setError(null);
    
    try {
      if (format === 'pdf') {
        const response = await api.get<{ invoice_pdf_url: string }>(
          `/payments/invoices/${invoiceId}/download_pdf/`
        );
        return response.data.invoice_pdf_url;
      } else {
        const response = await api.get(`/payments/invoices/${invoiceId}/export_csv/`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${invoiceId}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return url;
      }
    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      setError(err.response?.data?.detail || 'Failed to download invoice');
      toast.error('Failed to download invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const payInvoice = useCallback(async (invoiceId: string, paymentMethod?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<{
        transaction_id: string;
        status: string;
        payment_url?: string;
      }>(`/payments/invoices/${invoiceId}/pay/`, {
        payment_method: paymentMethod || 'mobile_money'
      });
      
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId 
          ? { ...inv, status: 'paid' as const, paid_date: new Date().toISOString() }
          : inv
      ));
      
      toast.success('Payment initiated successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error paying invoice:', err);
      setError(err.response?.data?.detail || 'Failed to process payment');
      toast.error('Failed to process payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvoiceStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/payments/invoices/stats/');
      return response.data;
    } catch (err: any) {
      console.error('Error fetching invoice stats:', err);
      setError(err.response?.data?.detail || 'Failed to fetch invoice stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============= PAYROLL CYCLES =============
  // ✅ ENDPOINTS: /payments/cycles/, /payments/cycles/current/, /payments/cycles/{year}/{month}/

  const fetchPayrollCycles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PaginatedResponse<PayrollCycle>>('/payments/cycles/');
      setPayrollCycles(response.data.results);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching payroll cycles:', err);
      setError(err.response?.data?.detail || 'Failed to fetch payroll cycles');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentPayrollCycle = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PayrollCycle>('/payments/cycles/current/');
      return response.data;
    } catch (err: any) {
      console.error('Error fetching current cycle:', err);
      setError(err.response?.data?.detail || 'Failed to fetch current cycle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPayrollCycle = useCallback(async (month: number, year: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PayrollCycle>(`/payments/cycles/${year}/${month}/`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching payroll cycle:', err);
      setError(err.response?.data?.detail || 'Failed to fetch payroll cycle');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============= WORKER PAYMENTS =============
  // ✅ ENDPOINTS: /payments/worker-payments/, /payments/worker-payments/{id}/, /payments/worker-payments/{id}/download_payslip/

  const fetchWorkerPayments = useCallback(async (filters?: { status?: string; worker_id?: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.worker_id) params.append('worker', filters.worker_id);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get<PaginatedResponse<WorkerPayment>>(`/payments/worker-payments/${queryString}`);
      
      setWorkerPayments(response.data.results);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching worker payments:', err);
      setError(err.response?.data?.detail || 'Failed to fetch worker payments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWorkerPaymentById = useCallback(async (paymentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<WorkerPayment>(`/payments/worker-payments/${paymentId}/`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching worker payment:', err);
      setError(err.response?.data?.detail || 'Failed to fetch worker payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadPayslip = useCallback(async (paymentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<{ payslip_pdf_url: string }>(
        `/payments/worker-payments/${paymentId}/download_payslip/`
      );
      return response.data.payslip_pdf_url;
    } catch (err: any) {
      console.error('Error downloading payslip:', err);
      setError(err.response?.data?.detail || 'Failed to download payslip');
      toast.error('Failed to download payslip');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============= PAYMENT METHODS =============
  // ✅ ENDPOINTS: /payments/payment-methods/, /payments/payment-methods/{id}/, /payments/payment-methods/{id}/set_default/, /payments/payment-methods/{id}/verify/

  const fetchPaymentMethods = useCallback(async (workerId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = workerId 
        ? `/payments/payment-methods/?worker=${workerId}`
        : '/payments/payment-methods/';
      
      const response = await api.get<PaginatedResponse<WorkerPaymentMethod>>(url);
      setPaymentMethods(response.data.results);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      setError(err.response?.data?.detail || 'Failed to fetch payment methods');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (methodData: Partial<WorkerPaymentMethod>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<WorkerPaymentMethod>('/payments/payment-methods/', methodData);
      setPaymentMethods(prev => [response.data, ...prev]);
      toast.success('Payment method added successfully');
      return response.data;
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError(err.response?.data?.detail || 'Failed to add payment method');
      toast.error('Failed to add payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePaymentMethod = useCallback(async (methodId: string, methodData: Partial<WorkerPaymentMethod>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.patch<WorkerPaymentMethod>(`/payments/payment-methods/${methodId}/`, methodData);
      setPaymentMethods(prev => prev.map(m => m.id === methodId ? response.data : m));
      toast.success('Payment method updated');
      return response.data;
    } catch (err: any) {
      console.error('Error updating payment method:', err);
      setError(err.response?.data?.detail || 'Failed to update payment method');
      toast.error('Failed to update payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePaymentMethod = useCallback(async (methodId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/payments/payment-methods/${methodId}/`);
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      toast.success('Payment method removed');
      return true;
    } catch (err: any) {
      console.error('Error deleting payment method:', err);
      setError(err.response?.data?.detail || 'Failed to delete payment method');
      toast.error('Failed to delete payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setDefaultPaymentMethod = useCallback(async (methodId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<WorkerPaymentMethod>(
        `/payments/payment-methods/${methodId}/set_default/`,
        {}
      );
      
      setPaymentMethods(prev => prev.map(m => ({
        ...m,
        is_default: m.id === methodId
      })));
      
      toast.success('Default payment method updated');
      return response.data;
    } catch (err: any) {
      console.error('Error setting default payment method:', err);
      setError(err.response?.data?.detail || 'Failed to set default payment method');
      toast.error('Failed to set default payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPaymentMethod = useCallback(async (methodId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<WorkerPaymentMethod>(
        `/payments/payment-methods/${methodId}/verify/`,
        {}
      );
      
      setPaymentMethods(prev => prev.map(m => 
        m.id === methodId ? response.data : m
      ));
      
      toast.success('Payment method verified');
      return response.data;
    } catch (err: any) {
      console.error('Error verifying payment method:', err);
      setError(err.response?.data?.detail || 'Failed to verify payment method');
      toast.error('Failed to verify payment method');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============= TRANSACTIONS =============
  // ✅ ENDPOINTS: /payments/transactions/, /payments/transactions/{id}/

  const fetchTransactions = useCallback(async (filters?: { 
    status?: string; 
    transaction_type?: string;
    page?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters?.page) params.append('page', String(filters.page));
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get<PaginatedResponse<PaymentTransaction>>(`/payments/transactions/${queryString}`);
      
      setTransactions(response.data.results);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.detail || 'Failed to fetch transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactionById = useCallback(async (transactionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PaymentTransaction>(`/payments/transactions/${transactionId}/`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching transaction:', err);
      setError(err.response?.data?.detail || 'Failed to fetch transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============= SERVICE FEE CONFIG =============
  // ✅ ENDPOINTS: /payments/fee-configs/, /payments/fee-configs/calculate/

  const fetchServiceFeeConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/payments/fee-configs/');
      return response.data;
    } catch (err: any) {
      console.error('Error fetching fee configs:', err);
      setError(err.response?.data?.detail || 'Failed to fetch fee configs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateServiceFee = useCallback(async (categoryId: string, salaryAmount: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/payments/fee-configs/calculate/', {
        category_id: categoryId,
        salary_amount: salaryAmount
      });
      return response.data;
    } catch (err: any) {
      console.error('Error calculating service fee:', err);
      setError(err.response?.data?.detail || 'Failed to calculate service fee');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    invoices,
    payrollCycles,
    workerPayments,
    paymentMethods,
    transactions,
    loading,
    error,
    pagination,
    
    // Invoices
    fetchInvoices,
    fetchInvoiceById,
    downloadInvoice,
    payInvoice,
    getInvoiceStats,
    
    // Payroll Cycles
    fetchPayrollCycles,
    getCurrentPayrollCycle,
    getPayrollCycle,
    
    // Worker Payments
    fetchWorkerPayments,
    fetchWorkerPaymentById,
    downloadPayslip,
    
    // Payment Methods
    fetchPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    verifyPaymentMethod,
    
    // Transactions
    fetchTransactions,
    fetchTransactionById,
    
    // Service Fee Config
    fetchServiceFeeConfigs,
    calculateServiceFee,
  };
}