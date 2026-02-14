// components/dashboard/DocumentUploadModal.tsx (FIXED DATE FIELDS)
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: FormData) => Promise<void>;
  uploading?: boolean; 
}

const DOCUMENT_TYPES = [
  { value: 'national_id', label: 'National ID', icon: '🆔' },
  { value: 'passport', label: 'Passport', icon: '🛂' },
  { value: 'police_check', label: 'Police Check Certificate', icon: '👮' },
  { value: 'medical_report', label: 'Medical Report', icon: '🏥' },
  { value: 'educational_certificate', label: 'Educational Certificate', icon: '🎓' },
  { value: 'reference_letter', label: 'Reference Letter', icon: '📝' },
  { value: 'other', label: 'Other Document', icon: '📄' },
];

export default function DocumentUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  uploading: externalUploading
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [internalUploading, setInternalUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploading = externalUploading !== undefined ? externalUploading : internalUploading;

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

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
    
    setFile(selectedFile);
    toast.success('File selected successfully!');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !documentType) {
      toast.error('Please select a file and document type');
      return;
    }
    
    if (externalUploading === undefined) {
      setInternalUploading(true);
    }
    
    try {
      const formData = new FormData();
      formData.append('document_file', file);
      formData.append('document_type', documentType);
      formData.append('document_number', documentNumber);
      
      if (issueDate) formData.append('issue_date', issueDate);
      if (expiryDate) formData.append('expiry_date', expiryDate);
      
      await onUpload(formData);
      
      resetForm();
      onClose();
      toast.success('Document uploaded successfully! Verification will take 1-2 business days.');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document. Please try again.');
    } finally {
      if (externalUploading === undefined) {
        setInternalUploading(false);
      }
    }
  };

  const resetForm = () => {
    setFile(null);
    setDocumentType('');
    setDocumentNumber('');
    setIssueDate('');
    setExpiryDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 pb-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
                <p className="text-sm text-gray-600 mt-1">Verify your identity and credentials</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={uploading}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto px-6 py-2 max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Document Type */}
            <div className="space-y-3">
              <Label htmlFor="document-type" className="text-base font-semibold text-gray-900">
                Document Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DOCUMENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setDocumentType(type.value)}
                    className={`p-4 border-2 rounded-xl text-center transition-all ${
                      documentType === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                id="document-type"
                value={documentType}
                required
              />
              {!documentType && (
                <p className="text-sm text-red-500 mt-1">Please select a document type</p>
              )}
            </div>

            {/* File Upload - Drag & Drop */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-900">
                Upload File <span className="text-red-500">*</span>
              </Label>
              <div 
                className={`border-2 border-dashed rounded-xl transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : file
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="p-8 text-center">
                  {file ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-3 bg-green-100 rounded-xl">
                          <FileText className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 truncate max-w-xs">{file.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="border-gray-300 hover:border-red-300 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                        >
                          Change File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Upload className="h-10 w-10 text-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">Drag & drop your file</p>
                        <p className="text-gray-600">or click to browse</p>
                        <p className="text-sm text-gray-500 mt-4">
                          Supported formats: JPG, PNG, PDF
                        </p>
                        <p className="text-sm text-gray-500">Max file size: 10MB</p>
                      </div>
                      <Input
                        ref={fileInputRef}
                        id="file-input"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-6 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse Files
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {!file && (
                <p className="text-sm text-red-500 mt-1">Please select a file to upload</p>
              )}
            </div>

            {/* Document Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Document Details
              </h3>
              
              {/* Document Number */}
              <div className="space-y-3">
                <Label htmlFor="document-number" className="text-base font-semibold text-gray-900">
                  Document Number
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="document-number"
                    placeholder="e.g., CF123456789012345XYZ"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="pl-12 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-0 rounded-xl text-base"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Required for ID verification. Leave blank for other documents.
                </p>
              </div>

              {/* Dates - IMPROVED FOR VISIBILITY */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-900">
                  Document Dates (Optional)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Issue Date */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="issue-date" className="text-sm font-medium text-gray-700">
                        Issue Date
                      </Label>
                      {issueDate && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatDisplayDate(issueDate)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Calendar className="h-6 w-6 text-gray-400" />
                      </div>
                      <Input
                        id="issue-date"
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="pl-12 py-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-0 rounded-xl text-base h-14"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      When was this document issued?
                    </p>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="expiry-date" className="text-sm font-medium text-gray-700">
                        Expiry Date
                      </Label>
                      {expiryDate && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {formatDisplayDate(expiryDate)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Calendar className="h-6 w-6 text-gray-400" />
                      </div>
                      <Input
                        id="expiry-date"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="pl-12 py-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-0 rounded-xl text-base h-14"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      When does this document expire? (if applicable)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Note:</span> Documents are verified within 1-2 business days
              </p>
              <p className="text-xs text-gray-500">
                Ensure all information is clear and readable
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={uploading}
                className="flex-1 sm:flex-none border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-6"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!file || !documentType || uploading}
                className={`flex-1 sm:flex-none px-8 ${
                  !file || !documentType
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </span>
                ) : (
                  'Upload Document'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}