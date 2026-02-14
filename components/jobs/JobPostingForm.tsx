// components/jobs/JobPostingForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useJobs, CreateJobData } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, X, Plus } from 'lucide-react';

interface JobPostingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

interface Category {
  id: string;
  name: string;
}

const JOB_TYPES = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Temporary', label: 'Temporary' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Remote', label: 'Remote' },
];

const EXPERIENCE_LEVELS = [
  { value: 'Entry', label: 'Entry Level' },
  { value: 'Mid', label: 'Mid Level' },
  { value: 'Senior', label: 'Senior Level' },
  { value: 'Executive', label: 'Executive' },
];

const SKILLS_LIST: string[] = [
  'Carpentry', 'Plumbing', 'Electrical', 'Masonry', 'Painting',
  'Welding', 'Driving', 'Cooking', 'Cleaning', 'Gardening',
  'Baby Sitting', 'Security', 'Reception', 'Administration',
  'Accounting', 'Sales', 'Marketing', 'IT Support', 'Web Development',
];

export default function JobPostingForm({ onSuccess, onCancel, initialData, isEditing = false }: JobPostingFormProps) {
  const { user } = useAuth();
  const { createJobPosting, updateJobPosting, loading } = useJobs();
  
  const [formData, setFormData] = useState<CreateJobData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    salary_min: initialData?.salary_range_min || initialData?.salary_min || 0,
    salary_max: initialData?.salary_range_max || initialData?.salary_max || 0,
    location: initialData?.location || '',
    work_schedule: initialData?.work_schedule || '',
    start_date: initialData?.start_date || '',
    category_id: initialData?.category_id || '',
    is_featured: initialData?.is_featured || false,
    job_type: initialData?.job_type || 'Full-time',
    experience_level: initialData?.experience_level || 'Mid',
    skills_required: initialData?.skills_required || [],
  });

  const [customSkill, setCustomSkill] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      // Try to fetch categories from your API
      const response = await fetch('http://127.0.0.1:8000/api/v1/job_postings/categories/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || data);
      } else {
        console.warn('Categories API not available, using default categories');
        // Provide fallback categories
        setCategories([
          { id: 'construction', name: 'Construction' },
          { id: 'domestic', name: 'Domestic Help' },
          { id: 'office', name: 'Office & Administration' },
          { id: 'technical', name: 'Technical Services' },
          { id: 'hospitality', name: 'Hospitality' },
          { id: 'security', name: 'Security Services' },
          { id: 'transport', name: 'Transport & Logistics' },
          { id: 'other', name: 'Other' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Provide fallback categories if API fails
      setCategories([
        { id: 'construction', name: 'Construction' },
        { id: 'domestic', name: 'Domestic Help' },
        { id: 'office', name: 'Office & Administration' },
        { id: 'technical', name: 'Technical Services' },
        { id: 'hospitality', name: 'Hospitality' },
        { id: 'security', name: 'Security Services' },
        { id: 'transport', name: 'Transport & Logistics' },
        { id: 'other', name: 'Other' },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a job title';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a job description';
    }

    if (formData.salary_min < 0) {
      newErrors.salary_min = 'Salary must be positive';
    }

    if (formData.salary_max < 0) {
      newErrors.salary_max = 'Salary must be positive';
    }

    if (formData.salary_min > formData.salary_max) {
      newErrors.salary_range = 'Minimum salary cannot be greater than maximum salary';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Please enter a location';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (isEditing && initialData?.id) {
        await updateJobPosting(initialData.id, formData);
        toast.success('Job updated successfully!');
      } else {
        await createJobPosting(formData);
        toast.success('Job posted successfully!');
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save job';
      toast.error(errorMessage);
    }
  };

  const handleAddSkill = () => {
    if (customSkill.trim() && !formData.skills_required?.includes(customSkill.trim())) {
      setFormData({
        ...formData,
        skills_required: [...(formData.skills_required || []), customSkill.trim()]
      });
      setCustomSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required?.filter((s: string) => s !== skill) || []
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkill.trim()) {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, is_featured: checked });
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    
    // Convert to number for salary fields
    if (id === 'salary_min' || id === 'salary_max') {
      setFormData({
        ...formData,
        [id]: parseInt(value) || 0
      });
    } else if (type === 'checkbox') {
      // Handle checkbox separately
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [id]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });
    }
    
    // Clear error for this field if it exists
    if (errors[id]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev: CreateJobData) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  // Handle textarea change for description and requirements
  const handleTextareaChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isEditing ? 'Edit Job Posting' : 'Post a New Job'}
        </CardTitle>
        <CardDescription>
          Fill in the details below to post a new job opportunity
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Senior Carpenter, Office Receptionist"
              value={formData.title}
              onChange={(e) => handleTextareaChange('title', e.target.value)}
              className={`py-3 text-base ${errors.title ? 'border-red-500' : ''}`}
              required
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Job Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the job responsibilities, expectations, and duties..."
              value={formData.description}
              onChange={(e) => handleTextareaChange('description', e.target.value)}
              className={`min-h-[150px] py-3 text-base ${errors.description ? 'border-red-500' : ''}`}
              required
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements" className="text-base font-semibold">
              Requirements
            </Label>
            <Textarea
              id="requirements"
              placeholder="List any specific requirements, qualifications, or experience needed..."
              value={formData.requirements || ''}
              onChange={(e) => handleTextareaChange('requirements', e.target.value)}
              className="min-h-[100px] py-3 text-base"
            />
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_min" className="text-base font-semibold">
                Minimum Salary (UGX) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salary_min"
                type="number"
                min="0"
                placeholder="e.g., 500000"
                value={formData.salary_min}
                onChange={handleInputChange}
                className={`py-3 text-base ${errors.salary_min ? 'border-red-500' : ''}`}
                required
              />
              {errors.salary_min && (
                <p className="text-sm text-red-500">{errors.salary_min}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salary_max" className="text-base font-semibold">
                Maximum Salary (UGX) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salary_max"
                type="number"
                min="0"
                placeholder="e.g., 1000000"
                value={formData.salary_max}
                onChange={handleInputChange}
                className={`py-3 text-base ${errors.salary_max ? 'border-red-500' : ''}`}
                required
              />
              {errors.salary_max && (
                <p className="text-sm text-red-500">{errors.salary_max}</p>
              )}
            </div>
          </div>
          {errors.salary_range && (
            <p className="text-sm text-red-500">{errors.salary_range}</p>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-semibold">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., Kampala, Gulu, Mbarara"
              value={formData.location}
              onChange={(e) => handleTextareaChange('location', e.target.value)}
              className={`py-3 text-base ${errors.location ? 'border-red-500' : ''}`}
              required
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Job Type & Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_type" className="text-base font-semibold">
                Job Type
              </Label>
              <Select
                value={formData.job_type}
                onValueChange={(value) => handleSelectChange('job_type', value)}
              >
                <SelectTrigger className="py-3 text-base">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience_level" className="text-base font-semibold">
                Experience Level
              </Label>
              <Select
                value={formData.experience_level}
                onValueChange={(value) => handleSelectChange('experience_level', value)}
              >
                <SelectTrigger className="py-3 text-base">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Work Schedule */}
          <div className="space-y-2">
            <Label htmlFor="work_schedule" className="text-base font-semibold">
              Work Schedule
            </Label>
            <Input
              id="work_schedule"
              placeholder="e.g., Monday-Friday, 8:00 AM - 5:00 PM"
              value={formData.work_schedule || ''}
              onChange={(e) => handleTextareaChange('work_schedule', e.target.value)}
              className="py-3 text-base"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-base font-semibold">
              Start Date
            </Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date || ''}
              onChange={handleDateChange}
              className="py-3 text-base"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-semibold">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleSelectChange('category_id', value)}
              disabled={loadingCategories}
            >
              <SelectTrigger className={`py-3 text-base ${errors.category_id ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
                {!loadingCategories && categories.length === 0 && (
                  <SelectItem value="other" disabled>
                    No categories available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-500">{errors.category_id}</p>
            )}
          </div>

          {/* Skills Required */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Skills Required
            </Label>
            
            {/* Selected Skills */}
            {formData.skills_required && formData.skills_required.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.skills_required.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:text-red-600 transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Add Skill */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a skill and press Enter or click Add"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={handleKeyPress}
                className="py-3 text-base"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSkill}
                disabled={!customSkill.trim()}
                className="whitespace-nowrap"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Common Skills */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Common skills:</p>
              <div className="flex flex-wrap gap-2">
                {SKILLS_LIST.map((skill: string) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className={`cursor-pointer hover:bg-gray-100 transition-colors ${
                      formData.skills_required?.includes(skill) 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : ''
                    }`}
                    onClick={() => {
                      if (formData.skills_required?.includes(skill)) {
                        handleRemoveSkill(skill);
                      } else {
                        setFormData({
                          ...formData,
                          skills_required: [...(formData.skills_required || []), skill]
                        });
                      }
                    }}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Job */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={formData.is_featured || false}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="is_featured" className="text-base font-medium cursor-pointer">
              Feature this job (Highlight in search results)
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Posting...'}
              </>
            ) : (
              isEditing ? 'Update Job' : 'Post Job'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}