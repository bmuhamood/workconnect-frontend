// components/dashboard/EmployerDashboard.tsx (Fixed)
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Briefcase, DollarSign, FileText, 
  TrendingUp, Clock, CheckCircle, AlertCircle,
  Plus, Search, MessageSquare, Download,
  Calendar, Building, CreditCard, BarChart
} from 'lucide-react';

interface EmployerDashboardProps {
  user: any;
  contracts: any[];
  payments: any[];
  onNewContract: () => void;
  onViewAll: (type: string) => void;
}

export default function EmployerDashboard({ 
  user, 
  contracts, 
  payments,
  onNewContract, 
  onViewAll 
}: EmployerDashboardProps) {
  const activeContracts = contracts.filter(c => c.status === 'active');
  const trialContracts = contracts.filter(c => c.status === 'trial');
  const totalSpent = contracts.reduce((sum, c) => sum + (c.total_monthly_cost || 0), 0);
  const activeWorkers = [...new Set(contracts.map(c => c.worker_id))].length;
  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold mt-2">{activeContracts.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Active Workers</p>
                <p className="text-2xl font-bold mt-2">{activeWorkers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              +2 this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold mt-2">
                  UGX {totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This month: UGX {(totalSpent * 0.3).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                <p className="text-2xl font-bold mt-2">92%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on worker performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={onNewContract} className="h-24 flex flex-col">
                  <Plus className="h-8 w-8 mb-2" />
                  <span>Hire Worker</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col" onClick={() => onViewAll('workers')}>
                  <Search className="h-8 w-8 mb-2" />
                  <span>Find Workers</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col" onClick={() => onViewAll('jobs')}>
                  <Briefcase className="h-8 w-8 mb-2" />
                  <span>My Job Posts</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col" onClick={() => onViewAll('messages')}>
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <span>Messages</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Contracts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Contracts</CardTitle>
              <CardDescription>
                Currently active workers and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-4 text-gray-600">No active contracts</p>
                  <Button className="mt-4" onClick={onNewContract}>
                    Hire Your First Worker
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.slice(0, 3).map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{contract.worker_name || 'Worker'}</p>
                          <p className="text-sm text-gray-500">{contract.job_title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          contract.status === 'active' ? 'default' :
                          contract.status === 'trial' ? 'secondary' : 'outline'
                        }>
                          {contract.status}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          UGX {contract.worker_salary_amount?.toLocaleString()}/month
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {contracts.length > 3 && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => onViewAll('contracts')}>
                  View All Contracts
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-4">
                  <CreditCard className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">No pending payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPayments.slice(0, 2).map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Invoice #{payment.invoice_number}</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(payment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold">UGX {payment.amount?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {pendingPayments.length > 0 && (
              <CardFooter>
                <Button className="w-full" onClick={() => onViewAll('payments')}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Contract signed', time: '2 hours ago', type: 'success' },
                  { action: 'Worker started trial', time: '1 day ago', type: 'info' },
                  { action: 'Payment received', time: '2 days ago', type: 'success' },
                  { action: 'Profile updated', time: '3 days ago', type: 'info' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`mt-1 mr-3 ${
                      activity.type === 'success' ? 'text-green-500' : 'text-blue-500'
                    }`}>
                      {activity.type === 'success' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Our support team is here to help you with any questions.
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => onViewAll('support')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Support
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => onViewAll('help')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Help Center
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => onViewAll('invoices')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}