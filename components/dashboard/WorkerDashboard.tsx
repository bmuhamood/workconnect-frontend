// components/dashboard/WorkerDashboard.tsx - Fixed
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, CheckCircle, Clock, AlertCircle, 
  DollarSign, FileText, Briefcase, UserCheck,
  TrendingUp, Shield
} from 'lucide-react';

interface WorkerDashboardProps {
  user: any;
  documents: any[];
  contracts: any[];
  payments: any[];
  onUploadDocument: () => void;
  onViewAll: (type: string) => void;
}

export default function WorkerDashboard({ 
  user, 
  documents, 
  contracts, 
  payments,
  onUploadDocument, 
  onViewAll 
}: WorkerDashboardProps) {
  const pendingDocuments = documents.filter(d => d.status === 'pending');
  const verifiedDocuments = documents.filter(d => d.status === 'verified');
  const activeContracts = contracts.filter(c => c.status === 'active');
  const trialContracts = contracts.filter(c => c.status === 'trial');
  
  const documentProgress = documents.length > 0 
    ? Math.round((verifiedDocuments.length / documents.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verification Status</p>
                <p className="text-2xl font-bold mt-2">
                  {documentProgress}%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={documentProgress} className="mt-4" />
            <p className="text-xs text-gray-500 mt-2">
              {verifiedDocuments.length} of {documents.length} documents verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold mt-2">{activeContracts.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {trialContracts.length} in trial period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold mt-2">
                  UGX {payments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + (p.amount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Next payment in 15 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trust Score</p>
                <p className="text-2xl font-bold mt-2">85/100</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on reviews & reliability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Document Verification</CardTitle>
                  <CardDescription>
                    Upload and verify your documents to get more job opportunities
                  </CardDescription>
                </div>
                <Button onClick={onUploadDocument}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-4 text-gray-600">No documents uploaded yet</p>
                  <Button className="mt-4" onClick={onUploadDocument}>
                    Upload Your First Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          doc.status === 'verified' ? 'bg-green-100' :
                          doc.status === 'pending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {doc.status === 'verified' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : doc.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{doc.document_type}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        doc.status === 'verified' ? 'default' :
                        doc.status === 'pending' ? 'secondary' :
                        'destructive'
                      } className="capitalize">
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {documents.length > 5 && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => onViewAll('documents')}>
                  View All Documents
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Contracts</CardTitle>
              <CardDescription>
                Active and past work contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-4 text-gray-600">No contracts yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Complete your verification to start getting job offers
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.slice(0, 5).map((contract) => (
                    <div key={contract.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{contract.job_title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {contract.employer_name} • {contract.work_location}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={
                              contract.status === 'active' ? 'default' :
                              contract.status === 'trial' ? 'secondary' :
                              'outline'
                            }>
                              {contract.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Salary: UGX {contract.worker_salary_amount?.toLocaleString()}/month
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Started: {new Date(contract.start_date).toLocaleDateString()}
                          </p>
                          {contract.trial_end_date && (
                            <p className="text-sm text-yellow-600 mt-1">
                              Trial ends: {new Date(contract.trial_end_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {contracts.length > 5 && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => onViewAll('contracts')}>
                  View All Contracts
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                Your salary payments and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-4 text-gray-600">No payments yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Payments will appear here after completing your first contract
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">
                          UGX {payment.amount?.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.scheduled_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        payment.status === 'completed' ? 'default' :
                        payment.status === 'pending' ? 'secondary' :
                        payment.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {payments.length > 5 && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => onViewAll('payments')}>
                  View All Payments
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <UserCheck className="h-4 w-4 mr-2" />
              Complete Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Briefcase className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onUploadDocument}>
              <FileText className="h-4 w-4 mr-2" />
              Update Documents
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => onViewAll('payments')}>
              <DollarSign className="h-4 w-4 mr-2" />
              View Earnings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Progress</CardTitle>
            <CardDescription>
              Complete these steps to get verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: 'Basic Information', completed: true },
                { step: 'Phone Verification', completed: user.phone_verified },
                { step: 'Profile Photo', completed: false },
                { step: 'Documents Upload', completed: documents.length >= 2 },
                { step: 'Background Check', completed: false },
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                    item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.completed ? '✓' : index + 1}
                  </div>
                  <span className={item.completed ? 'text-green-600' : 'text-gray-600'}>
                    {item.step}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}