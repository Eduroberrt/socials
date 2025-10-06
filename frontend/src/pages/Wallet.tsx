import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  Plus, 
  History, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Copy,
  Check,
  CreditCard,
  Banknote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DashboardNavbar from '@/components/DashboardNavbar';
import MobileBottomNavigation from '@/components/MobileBottomNavigation';
import NotificationSystem, { useNotifications } from '@/components/NotificationSystem';
import { referralService } from '@/services/referralService';

const Wallet = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [copied, setCopied] = useState(false);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  
  const { notifications, addNotification, dismissNotification } = useNotifications();

  // Mock wallet data
  const walletBalance = 125.50;
  const pendingBalance = 15.00;
  const accountNumber = "1234567890";
  
  // Mock transaction history
  const transactions = [
    {
      id: 'TXN001',
      type: 'deposit',
      amount: 50.00,
      description: 'Card Deposit',
      status: 'completed',
      date: '2024-10-05T10:30:00Z',
      reference: 'DEP-001-2024'
    },
    {
      id: 'TXN002',
      type: 'purchase',
      amount: -25.00,
      description: 'Instagram Account Purchase',
      status: 'completed',
      date: '2024-10-04T15:45:00Z',
      reference: 'PUR-002-2024'
    },
    {
      id: 'TXN003',
      type: 'deposit',
      amount: 100.00,
      description: 'Bank Transfer',
      status: 'completed',
      date: '2024-10-03T09:15:00Z',
      reference: 'DEP-003-2024'
    },
    {
      id: 'TXN004',
      type: 'purchase',
      amount: -15.50,
      description: 'Gmail Account Purchase',
      status: 'completed',
      date: '2024-10-02T14:20:00Z',
      reference: 'PUR-004-2024'
    },
    {
      id: 'TXN005',
      type: 'deposit',
      amount: 25.00,
      description: 'Card Deposit',
      status: 'pending',
      date: '2024-10-05T16:00:00Z',
      reference: 'DEP-005-2024'
    }
  ];

  const handleCopyReference = (reference: string) => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid deposit amount.',
        duration: 3000
      });
      return;
    }
    
    setIsProcessingDeposit(true);
    
    try {
      // Simulate deposit processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const amount = parseFloat(depositAmount);
      
      // Process referral reward if deposit qualifies (>= $25)
      if (amount >= 25) {
        // In production, you'd get the actual user ID from auth context
        const userId = 'current-user-123';
        await referralService.processDeposit(userId, amount);
        
        // Show referral reward notification
        addNotification({
          type: 'success',
          title: 'Referral Reward Processed!',
          message: 'Your referrer has earned ₦1,000 (~$0.65) from your deposit.',
          duration: 5000
        });
      }
      
      setDepositSuccess(true);
      const depositedAmount = depositAmount;
      setDepositAmount('');
      
      // Show success notification
      addNotification({
        type: 'success',
        title: 'Deposit Successful',
        message: `$${depositedAmount} has been added to your wallet.`,
        duration: 4000
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => setDepositSuccess(false), 3000);
      
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deposit Failed',
        message: 'Something went wrong. Please try again.',
        duration: 4000
      });
      console.error('Deposit error:', error);
    } finally {
      setIsProcessingDeposit(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'purchase':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      default:
        return <History className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-900/20 text-green-400 border-green-500/30">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-900/20 text-red-400 border-red-500/30">Failed</Badge>;
      default:
        return <Badge className="bg-gray-900/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavbar />
      <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <WalletIcon className="w-8 h-8 text-saas-orange" />
            <h1 className="text-3xl font-bold">Wallet</h1>
          </div>
          <p className="text-gray-400">Manage your funds and transaction history</p>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Available Balance */}
          <Card className="bg-gradient-to-br from-saas-orange to-orange-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Available Balance</p>
                  <p className="text-3xl font-bold text-white">${walletBalance.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Balance */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Pending Balance</p>
                  <p className="text-3xl font-bold text-white">${pendingBalance.toFixed(2)}</p>
                </div>
                <History className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="deposit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-700">
            <TabsTrigger 
              value="deposit" 
              className="data-[state=active]:bg-saas-orange data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Deposit
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-saas-orange data-[state=active]:text-white"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Deposit Tab */}
          <TabsContent value="deposit">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Deposit Form */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-saas-orange" />
                    Add Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Methods */}
                  <div>
                    <label className="text-white text-sm font-medium mb-3 block">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'}
                        className={`justify-start h-12 ${
                          selectedPaymentMethod === 'card' 
                            ? 'bg-saas-orange hover:bg-saas-orange/90' 
                            : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedPaymentMethod('card')}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Card
                      </Button>
                      <Button
                        variant={selectedPaymentMethod === 'bank' ? 'default' : 'outline'}
                        className={`justify-start h-12 ${
                          selectedPaymentMethod === 'bank' 
                            ? 'bg-saas-orange hover:bg-saas-orange/90' 
                            : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedPaymentMethod('bank')}
                      >
                        <Banknote className="w-4 h-4 mr-2" />
                        Bank Transfer
                      </Button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Amount (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="25.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-saas-orange"
                        min="5"
                        step="0.01"
                      />
                    </div>
                    {/* Referral threshold notice */}
                    {depositAmount && parseFloat(depositAmount) > 0 && parseFloat(depositAmount) < 25 && (
                      <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-yellow-400 text-xs">
                        ℹ️ Deposit $25+ to trigger referral rewards for your referrer.
                      </div>
                    )}
                    <p className="text-gray-400 text-xs mt-1">Minimum deposit: $5.00</p>
                  </div>

                  {/* Deposit Button */}
                  <Button
                    onClick={handleDeposit}
                    className="w-full bg-saas-orange hover:bg-saas-orange/90 text-white font-medium py-3"
                    disabled={!depositAmount || parseFloat(depositAmount) < 5 || isProcessingDeposit}
                  >
                    {isProcessingDeposit ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        Processing...
                      </div>
                    ) : (
                      `Deposit $${depositAmount || '0.00'}`
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <WalletIcon className="w-5 h-5 text-saas-orange" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                      onClick={() => setDepositAmount('25')}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add $25 (Qualify for Referral Rewards)
                    </Button>
                    <Button 
                      className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                      onClick={() => setDepositAmount('50')}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add $50
                    </Button>
                    <Button 
                      className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                      onClick={() => setDepositAmount('100')}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add $100
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm mb-2">Account Details</p>
                    <div className="bg-gray-800/50 p-3 rounded border border-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Account: {accountNumber}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyReference(accountNumber)}
                          className="h-6 px-2 text-gray-400 hover:text-white"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-saas-orange" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded border border-gray-700 hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="text-white font-medium">{transaction.description}</p>
                          <p className="text-gray-400 text-sm">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </p>
                          <p className="text-gray-400 text-sm">{transaction.reference}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileBottomNavigation />
    </div>
  );
};

export default Wallet;