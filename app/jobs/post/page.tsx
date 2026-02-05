'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft, Briefcase, Calendar, DollarSign, MapPin,
  Users, Clock, Award, FileText, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

const JOB_CATEGORIES = [
  'Construction', 'Electrical', 'Plumbing', 'Cleaning', 'Driving',
  'Security', 'Cooking', 'Gardening', 'Teaching', 'Healthcare',
  'Technical', 'Administrative', 'Customer Service', 'Other'
];

const JOB_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'project_based', label: 'Project Based' },
];

const EXPERIENCE_LEVELS = [
  'Entry Level', 'Intermediate', 'Experienced', 'Expert'
];

const SKILLS_LIST = [
  'Leadership', 'Communication', 'Problem Solving', 'Teamwork',
  'Time Management', 'Technical Skills', 'Customer Service',
  'Physical Stamina', 'Attention to Detail', 'Safety Conscious'
];

export default function JobPostingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    job_type: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    city: '',
    salary_min: '',
    salary_max: '',
    experience_level: '',
    number_of_positions: '1',
    start_date: '',
    end_date: '',
    is_urgent: false,
    requires_interview: true,
    provide_equipment: false,
    provide_transport: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Final validation
    if (!formData.title || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your actual API endpoint
      await api.post('/api/jobs/', {
        ...formData,
        skills: selectedSkills,
        posted_by: user?.id,
      });
      
      toast.success('Job posted successfully!');
      router.push('/jobs');
    } catch (error) {
      toast.error('Failed to post job');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const calculateTotalSteps = 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
            <p className="text-gray-600">Find the perfect worker for your needs</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Step {step} of {calculateTotalSteps}</div>
            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${(step / calculateTotalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>Basic Job Information</CardTitle>
                        <CardDescription>Tell us about the job position</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="e.g., Senior Electrician Needed"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Job Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => handleSelectChange('category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {JOB_CATEGORIES.map(category => (
                                <SelectItem key={category} value={category.toLowerCase()}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="job_type">Job Type *</Label>
                          <Select
                            value={formData.job_type}
                            onValueChange={(value) => handleSelectChange('job_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                              {JOB_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Job Description *</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Describe the job responsibilities, work environment, and expectations..."
                          rows={6}
                          required
                          className="min-h-[120px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="number_of_positions">Number of Positions</Label>
                          <Input
                            id="number_of_positions"
                            name="number_of_positions"
                            type="number"
                            min="1"
                            value={formData.number_of_positions}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="experience_level">Experience Level</Label>
                          <Select
                            value={formData.experience_level}
                            onValueChange={(value) => handleSelectChange('experience_level', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              {EXPERIENCE_LEVELS.map(level => (
                                <SelectItem key={level} value={level.toLowerCase()}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Details & Requirements */}
              {step === 2 && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle>Job Details & Requirements</CardTitle>
                        <CardDescription>Specify requirements and conditions</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements *</Label>
                        <Textarea
                          id="requirements"
                          name="requirements"
                          value={formData.requirements}
                          onChange={handleChange}
                          placeholder="List the qualifications, skills, and requirements needed..."
                          rows={4}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="responsibilities">Key Responsibilities</Label>
                        <Textarea
                          id="responsibilities"
                          name="responsibilities"
                          value={formData.responsibilities}
                          onChange={handleChange}
                          placeholder="Describe the main duties and responsibilities..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Required Skills</Label>
                        <div className="flex flex-wrap gap-2">
                          {SKILLS_LIST.map(skill => (
                            <Badge
                              key={skill}
                              variant={selectedSkills.includes(skill) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleSkill(skill)}
                            >
                              {selectedSkills.includes(skill) && (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Job Conditions</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="is_urgent"
                              checked={formData.is_urgent}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, is_urgent: checked as boolean })
                              }
                            />
                            <Label htmlFor="is_urgent" className="cursor-pointer">
                              Urgent Hiring Needed
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="requires_interview"
                              checked={formData.requires_interview}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, requires_interview: checked as boolean })
                              }
                            />
                            <Label htmlFor="requires_interview" className="cursor-pointer">
                              Interview Required
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="provide_equipment"
                              checked={formData.provide_equipment}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, provide_equipment: checked as boolean })
                              }
                            />
                            <Label htmlFor="provide_equipment" className="cursor-pointer">
                              Equipment Provided
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="provide_transport"
                              checked={formData.provide_transport}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, provide_transport: checked as boolean })
                              }
                            />
                            <Label htmlFor="provide_transport" className="cursor-pointer">
                              Transport Provided
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Location & Compensation */}
              {step === 3 && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle>Location & Compensation</CardTitle>
                        <CardDescription>Set location and salary details</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Work Location *</Label>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              placeholder="e.g., Industrial Area, Kampala"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="city">City/Town *</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              placeholder="e.g., Kampala"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="salary_min">Salary Range (UGX) *</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Input
                                  id="salary_min"
                                  name="salary_min"
                                  type="number"
                                  value={formData.salary_min}
                                  onChange={handleChange}
                                  placeholder="Min"
                                  required
                                />
                              </div>
                              <div>
                                <Input
                                  id="salary_max"
                                  name="salary_max"
                                  type="number"
                                  value={formData.salary_max}
                                  onChange={handleChange}
                                  placeholder="Max"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="start_date">Start Date</Label>
                              <Input
                                id="start_date"
                                name="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="end_date">End Date (if temporary)</Label>
                              <Input
                                id="end_date"
                                name="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preview Card */}
                      <div className="border rounded-lg p-6 bg-gray-50">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Job Preview</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Job Title:</span>
                            <span className="font-semibold">{formData.title || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-semibold">{formData.category || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-semibold">{formData.location || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Salary Range:</span>
                            <span className="font-semibold">
                              UGX {formData.salary_min ? parseInt(formData.salary_min).toLocaleString() : '0'} - 
                              {formData.salary_max ? parseInt(formData.salary_max).toLocaleString() : '0'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Positions:</span>
                            <span className="font-semibold">{formData.number_of_positions}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Previous Step
                  </Button>
                ) : (
                  <div></div>
                )}
                
                <Button
                  type="submit"
                  className="px-8"
                  disabled={isLoading}
                >
                  {step === calculateTotalSteps ? (
                    isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                        Posting Job...
                      </>
                    ) : (
                      'Post Job Now'
                    )
                  ) : (
                    'Next Step'
                  )}
                </Button>
              </div>
            </div>

            {/* Right Column - Tips & Guidelines */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Posting Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Be Specific</h4>
                        <p className="text-sm text-gray-600">
                          Clearly describe responsibilities and requirements
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Competitive Pay</h4>
                        <p className="text-sm text-gray-600">
                          Offer fair wages to attract quality workers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">Clear Expectations</h4>
                        <p className="text-sm text-gray-600">
                          Specify work hours, duration, and conditions
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                <CardHeader>
                  <CardTitle className="text-green-900 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
                      All jobs are reviewed before going live
                    </li>
                    <li className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
                      You can edit or remove your job posting anytime
                    </li>
                    <li className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
                      Verified workers will be prioritized in search results
                    </li>
                    <li className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></div>
                      Consider using our escrow service for secure payments
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Active Workers</span>
                      </div>
                      <span className="font-bold">500+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span>Jobs Posted</span>
                      </div>
                      <span className="font-bold">1,200+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        <span>Success Rate</span>
                      </div>
                      <span className="font-bold">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
