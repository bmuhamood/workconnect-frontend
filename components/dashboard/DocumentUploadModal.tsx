// components/dashboard/DocumentUploadModal.tsx (Fixed)
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: FormData) => Promise<void>;
}

const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'police_check', label: 'Police Check Certificate' },
  { value: 'medical_report', label: 'Medical Report' },
  { value: 'educational_certificate', label: 'Educational Certificate' },
  { value: 'reference_letter', label: 'Reference Letter' },
  { value: 'other', label: 'Other Document' },
];

export default function DocumentUploadModal({ isOpen, onClose, onUpload }: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a JPG, PNG, or PDF file');
        return;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('document_file', file);
      formData.append('document_type', documentType);
      formData.append('document_number', documentNumber);
      
      if (issueDate) formData.append('issue_date', issueDate);
      if (expiryDate) formData.append('expiry_date', expiryDate);
      
      await onUpload(formData);
      
      // Reset form
      resetForm();
      onClose();
      
      toast.success('Document uploaded successfully! It will be verified shortly.');
    } catch (error) {
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setDocumentType('');
    setDocumentNumber('');
    setIssueDate('');
    setExpiryDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upload Document</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type *</Label>
              <select
                id="document-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select document type</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Document File *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, PDF up to 10MB
                    </p>
                    <Input
                      id="file"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      Select File
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Document Number */}
            <div className="space-y-2">
              <Label htmlFor="document-number">Document Number</Label>
              <Input
                id="document-number"
                placeholder="e.g., CF123456789012345XYZ"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue-date">Issue Date (Optional)</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Expiry Date (Optional)</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!file || !documentType || uploading}>
                {uploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}