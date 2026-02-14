// components/ProfilePhotoUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Resizer from 'react-image-file-resizer';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  uploading: boolean;
  workerId?: string;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  onUpload,
  onRemove,
  uploading,
}: ProfilePhotoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeFile = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        500, // max width
        500, // max height
        'JPEG',
        85, // quality
        0, // rotation
        (uri) => {
          if (typeof uri === 'string') {
            // Convert base64 to File
            fetch(uri)
              .then(res => res.blob())
              .then(blob => {
                const resizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(resizedFile);
              });
          } else {
            resolve(uri as File);
          }
        },
        'base64' // output type
      );
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Resize the image
      const resizedFile = await resizeFile(file);
      
      // Upload to server
      await onUpload(resizedFile);
      
      toast.success('Profile photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    try {
      setIsUploading(true);
      await onRemove();
      setPreviewUrl(null);
      toast.success('Profile photo removed');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Photo Container */}
        <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Profile"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-4xl">
              {/* Placeholder with initials */}
            </span>
          )}
        </div>

        {/* Upload Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
          <label
            htmlFor="photo-upload"
            className="cursor-pointer p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <Camera className="h-5 w-5 text-gray-700" />
            <input
              ref={fileInputRef}
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading || uploading}
            />
          </label>
        </div>

        {/* Loading Spinner */}
        {(isUploading || uploading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {/* Remove Button */}
      {previewUrl && onRemove && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          disabled={isUploading || uploading}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-2" />
          Remove Photo
        </Button>
      )}
    </div>
  );
}