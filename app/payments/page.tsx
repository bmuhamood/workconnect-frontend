'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard, DollarSign, CheckCircle, Clock, AlertCircle,
  Download, Receipt, Wallet, Shield, Lock, Smartphone,
  Banknote, ArrowRight, Eye, EyeOff, Calendar
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'payment' | 'withdrawal' | 'refund';
  reference: string;
}

interface PaymentMethod {
  id: string;
  type: 'mtn' | 'airtel' | 'bank' | 'card';
  lastFour: string;
  isDefault: boolean;
  expiryDate?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState(450000);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: new Date('2024-01-15'),
      description: 'Payment for John Kamya - Electrical work',
      amount: 150000,
      status: 'completed',
      type: 'payment',
      reference: 'TX-001234',
    },
    {
      id: '2',
      date: new Date('2024-01-14'),
      description: 'Withdrawal to Bank Account',
      amount: -200000,
      status: 'completed',
      type: 'withdrawal',
      reference: 'TX-001233',
    },
    {
      id: '3',
      date: new Date('2024-01-13'),
      description: 'Payment for Sarah Nakato - Cleaning service',
      amount: 80000,
      status: 'pending',
      type: 'payment',
      reference: 'TX-001232',
    },
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'mtn', lastFour: '7856', isDefault: true },
    { id: '2', type: 'airtel', lastFour: '4321', isDefault: false },
    { id: '3', type: 'bank', lastFour: '7890', isDefault: false },
  ]);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    phoneNumber: '',
    paymentMethod: '',
    description: '',
  });

  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    accountNumber: '',
    bankName: '',
    accountName: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [user]);

  const handleMakePayment = () => {
    if (!paymentForm.amount || !paymentForm.phoneNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(`Payment of UGX ${parseInt(paymentForm.amount).toLocaleString()} initiated`);
    setPaymentForm({ amount: '', phoneNumber: '', paymentMethod: '', description: '' });
  };

  const handleWithdraw = () => {
    if (!withdrawalForm.amount || !withdrawalForm.accountNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(`Withdrawal request submitted for UGX ${parseInt(withdrawalForm.amount).toLocaleString()}`);
    setWithdrawalForm({ amount: '', accountNumber: '', bankName: '', accountName: '' });
  };

  const handleAddPaymentMethod = () => {
    toast.success('Add payment method feature coming soon');
  };

  const handleDownloadReceipt = (transactionId: string) => {
    toast.success(`Downloading receipt for ${transactionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="text-blue-100 mt-1">Manage your payments and transactions</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Link href="/dashboard">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-blue-100">Available Balance</p>
                <div className="flex items-center mt-2">
                  <h2 className="text-4xl font-bold">
                    {showBalance ? `UGX ${balance.toLocaleString()}` : '••••••••'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-3 text-white hover:bg-white/20"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="text-blue-100 mt-2">Last updated: Just now</p>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('send')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Send Money
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('withdraw')}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="send">Send Money</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                        Payment Methods
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                method.type === 'mtn' ? 'bg-yellow-100' :
                                method.type === 'airtel' ? 'bg-red-100' :
                                method.type === 'bank' ? 'bg-blue-100' : 'bg-purple-100'
                              }`}>
                                {method.type === 'mtn' ? (
                                  <Smartphone className="h-5 w-5 text-yellow-600" />
                                ) : method.type === 'airtel' ? (
                                  <Smartphone className="h-5 w-5 text-red-600" />
                                ) : method.type === 'bank' ? (
                                  <Banknote className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <CreditCard className="h-5 w-5 text-purple-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold capitalize">{method.type} Money</h4>
                                <p className="text-sm text-gray-600">•••• {method.lastFour}</p>
                              </div>
                            </div>
                            {method.isDefault && (
                              <Badge className="bg-green-100 text-green-800">Default</Badge>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleAddPaymentMethod}
                        >
                          + Add New Payment Method
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-green-600" />
                        Security Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Lock className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Secure Transactions</h4>
                            <p className="text-sm text-gray-600">All payments are encrypted and secure</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Escrow Protection</h4>
                            <p className="text-sm text-gray-600">Funds held securely until work is completed</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Instant Notifications</h4>
                            <p className="text-sm text-gray-600">Get real-time updates on all transactions</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Transactions</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('history')}>
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'payment' ? 'bg-blue-100' :
                              transaction.type === 'withdrawal' ? 'bg-green-100' : 'bg-amber-100'
                            }`}>
                              {transaction.type === 'payment' ? (
                                <DollarSign className="h-5 w-5 text-blue-600" />
                              ) : transaction.type === 'withdrawal' ? (
                                <Wallet className="h-5 w-5 text-green-600" />
                              ) : (
                                <Receipt className="h-5 w-5 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-600">
                                  {transaction.date.toLocaleDateString()}
                                </span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-600">{transaction.reference}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}UGX {Math.abs(transaction.amount).toLocaleString()}
                            </div>
                            <Badge className={`mt-1 ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Send Money Tab */}
              <TabsContent value="send">
                <Card>
                  <CardHeader>
                    <CardTitle>Send Payment</CardTitle>
                    <CardDescription>Make a payment to a worker or service provider</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (UGX) *</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            placeholder="Enter amount"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">Recipient Phone Number *</Label>
                          <Input
                            id="phoneNumber"
                            value={paymentForm.phoneNumber}
                            onChange={(e) => setPaymentForm({ ...paymentForm, phoneNumber: e.target.value })}
                            placeholder="07XXXXXXXX or +256XXXXXXXXX"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method *</Label>
                          <Select
                            value={paymentForm.paymentMethod}
                            onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                              <SelectItem value="airtel">Airtel Money</SelectItem>
                              <SelectItem value="bank">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Input
                            id="description"
                            value={paymentForm.description}
                            onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                            placeholder="e.g., Payment for electrical work"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Payment Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-semibold">
                              UGX {paymentForm.amount ? parseInt(paymentForm.amount).toLocaleString() : '0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction Fee:</span>
                            <span className="font-semibold">
                              UGX {paymentForm.amount ? Math.round(parseInt(paymentForm.amount) * 0.01).toLocaleString() : '0'}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-bold text-lg">
                              UGX {paymentForm.amount ? (parseInt(paymentForm.amount) + Math.round(parseInt(paymentForm.amount) * 0.01)).toLocaleString() : '0'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        size="lg"
                        onClick={handleMakePayment}
                        disabled={!paymentForm.amount || !paymentForm.phoneNumber}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Confirm & Send Payment
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Withdraw Tab */}
              <TabsContent value="withdraw">
                <Card>
                  <CardHeader>
                    <CardTitle>Withdraw Funds</CardTitle>
                    <CardDescription>Transfer funds to your bank account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="withdrawAmount">Amount (UGX) *</Label>
                          <Input
                            id="withdrawAmount"
                            type="number"
                            value={withdrawalForm.amount}
                            onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                            placeholder="Enter amount to withdraw"
                          />
                          <p className="text-sm text-gray-500">Available: UGX {balance.toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bankName">Bank Name *</Label>
                            <Select
                              value={withdrawalForm.bankName}
                              onValueChange={(value) => setWithdrawalForm({ ...withdrawalForm, bankName: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select bank" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                                <SelectItem value="centenary">Centenary Bank</SelectItem>
                                <SelectItem value="dfcu">DFCU Bank</SelectItem>
                                <SelectItem value="equity">Equity Bank</SelectItem>
                                <SelectItem value="absa">Absa Bank</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number *</Label>
                            <Input
                              id="accountNumber"
                              value={withdrawalForm.accountNumber}
                              onChange={(e) => setWithdrawalForm({ ...withdrawalForm, accountNumber: e.target.value })}
                              placeholder="Enter account number"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="accountName">Account Holder Name *</Label>
                          <Input
                            id="accountName"
                            value={withdrawalForm.accountName}
                            onChange={(e) => setWithdrawalForm({ ...withdrawalForm, accountName: e.target.value })}
                            placeholder="As it appears on bank account"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-amber-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-amber-900">Important Information</h4>
                            <ul className="text-sm text-amber-800 mt-2 space-y-1">
                              <li>• Withdrawals are processed within 1-3 business days</li>
                              <li>• A transaction fee of UGX 2,500 applies</li>
                              <li>• Minimum withdrawal amount is UGX 10,000</li>
                              <li>• Ensure account details are correct before submitting</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        size="lg"
                        onClick={handleWithdraw}
                        disabled={!withdrawalForm.amount || !withdrawalForm.accountNumber}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Request Withdrawal
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>All your payments and withdrawals</CardDescription>
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Statement
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                              transaction.type === 'payment' ? 'bg-blue-100' :
                              transaction.type === 'withdrawal' ? 'bg-green-100' : 'bg-amber-100'
                            }`}>
                              {transaction.type === 'payment' ? (
                                <DollarSign className="h-6 w-6 text-blue-600" />
                              ) : transaction.type === 'withdrawal' ? (
                                <Wallet className="h-6 w-6 text-green-600" />
                              ) : (
                                <Receipt className="h-6 w-6 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{transaction.description}</h4>
                              <div className="flex items-center space-x-3 mt-1">
                                <span className="text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {transaction.date.toLocaleDateString()}
                                </span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-600">{transaction.reference}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}UGX {Math.abs(transaction.amount).toLocaleString()}
                            </div>
                            <div className="flex items-center justify-end space-x-2 mt-2">
                              <Badge className={`${
                                transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status === 'completed' ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : transaction.status === 'pending' ? (
                                  <Clock className="h-3 w-3 mr-1" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                )}
                                {transaction.status}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReceipt(transaction.id)}
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="outline">Load More Transactions</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Support Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-blue-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Report a Problem
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Receipt className="h-4 w-4 mr-2" />
                    Request Refund
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Tips
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Limit</span>
                    <span className="font-semibold">UGX 5,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Limit</span>
                    <span className="font-semibold">UGX 50,000,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Single Transaction</span>
                    <span className="font-semibold">UGX 2,000,000</span>
                  </div>
                  <Separator />
                  <p className="text-sm text-gray-500">
                    Limits are reset at midnight. Contact support to increase limits.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-3">
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                        <Receipt className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs">View Invoices</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-3">
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                        <Download className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-xs">Tax Documents</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-3">
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-xs">Schedule Payment</span>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto py-3">
                    <div className="text-center">
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-xs">Security</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}