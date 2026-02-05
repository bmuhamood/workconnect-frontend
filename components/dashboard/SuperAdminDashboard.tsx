// components/dashboard/SuperAdminDashboard.tsx - Fixed
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Briefcase, DollarSign, FileCheck, 
  BarChart3, Shield, AlertTriangle, Settings,
  TrendingUp, Clock, CheckCircle, Download,
  Server, Database, Cpu, Globe
} from 'lucide-react';

interface SuperAdminDashboardProps {
  user: any;
  data: any;
  onRefresh: () => Promise<void>;
}

export default function SuperAdminDashboard({ user, data, onRefresh }: SuperAdminDashboardProps) {
  const platformMetrics = data.metrics || {};
  
  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Administration Dashboard</h2>
          <p className="text-gray-600">Platform analytics and management</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onRefresh}>
            <Settings className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold mt-2">
                  {platformMetrics.total_users || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{platformMetrics.user_growth || 0}% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold mt-2">
                  {platformMetrics.active_contracts || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{platformMetrics.contract_growth || 0}% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold mt-2">
                  UGX {(platformMetrics.monthly_revenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-green-500 mt-2">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{platformMetrics.revenue_growth || 0}% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold mt-2">
                  {platformMetrics.pending_verifications || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileCheck className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Document Verifications', count: platformMetrics.pending_documents || 0, icon: FileCheck },
                { type: 'Contract Approvals', count: platformMetrics.pending_contracts || 0, icon: Briefcase },
                { type: 'Payment Issues', count: platformMetrics.pending_payments || 0, icon: DollarSign },
                { type: 'User Reports', count: platformMetrics.pending_reports || 0, icon: AlertTriangle },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span>{item.type}</span>
                  </div>
                  <Badge variant="secondary">{item.count} pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform services status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { service: 'API Service', status: 'operational', icon: Server },
                { service: 'Database', status: 'operational', icon: Database },
                { service: 'Payment Gateway', status: 'operational', icon: DollarSign },
                { service: 'Email Service', status: 'operational', icon: Globe },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span>{item.service}</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Administrative tools and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex flex-col">
              <Users className="h-8 w-8 mb-2" />
              <span>User Management</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <BarChart3 className="h-8 w-8 mb-2" />
              <span>Analytics</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <Shield className="h-8 w-8 mb-2" />
              <span>Verifications</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <DollarSign className="h-8 w-8 mb-2" />
              <span>Financial Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}