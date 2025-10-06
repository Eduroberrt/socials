import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, Gift, DollarSign, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardNavbar from '@/components/DashboardNavbar';
import MobileBottomNavigation from '@/components/MobileBottomNavigation';
import { referralService } from '@/services/referralService';
import { ReferralData, ReferralStats, convertUsdToNgn, CURRENCY_RATES } from '@/data/referrals';

const Referrals = () => {
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  
  // Mock current user ID (in real app, this would come from auth context)
  const currentUserId = 'user_123';

  useEffect(() => {
    // Initialize or get user's referral data
    const data = referralService.getUserReferralData(currentUserId) || 
                 referralService.initializeUserReferral(currentUserId);
    setReferralData(data);

    // Get referral stats
    const stats = referralService.getReferralStats(currentUserId);
    setReferralStats(stats);

    // Get recent referrals
    const recent = referralService.getRecentReferrals(currentUserId, 5);
    setRecentReferrals(recent);
  }, [currentUserId]);
  
  const handleCopyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-saas-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Referral Program</h1>
          <p className="text-gray-300 text-lg max-w-3xl">
            Invite your friends to Acctthrive and earn rewards together! Share your referral link or code with friends and earn rewards for every successful referral.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Rewards & Instructions */}
          <div className="space-y-6">
            
            {/* Reward Card */}
            <Card className="bg-saas-darkGray border-saas-orange/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gift className="w-6 h-6 text-saas-orange mr-2" />
                  Receive reward instantly
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  When your friend registers, funds wallet with minimum of $25 and purchases at least one account, you get rewarded instantly.
                </p>
              </CardContent>
            </Card>

            {/* How to Use Card */}
            <Card className="bg-saas-darkGray border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-6 h-6 text-saas-orange mr-2" />
                  How to use invitation code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-saas-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-gray-300">Share invitation link/code with friends</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-saas-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-gray-300">Let friends sign up and fund wallet with minimum of $25</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-saas-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-gray-300">Receive reward instantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Referral Links */}
          <div className="space-y-6">
            
            {/* Referral Link Card */}
            <Card className="bg-saas-darkGray border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Referral Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={referralData?.referralLink || 'Loading...'}
                    readOnly
                    className="bg-saas-black border-gray-600 text-white"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                    className="border-saas-orange text-saas-orange hover:bg-saas-orange hover:text-white"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-gray-400 text-sm">
                  Share this link with your friends to earn rewards
                </p>
              </CardContent>
            </Card>

            {/* Referral Code Card */}
            <Card className="bg-saas-darkGray border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Referral Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={referralData?.referralCode || 'Loading...'}
                    readOnly
                    className="bg-saas-black border-gray-600 text-white text-center text-lg font-mono"
                  />
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="icon"
                    className="border-saas-orange text-saas-orange hover:bg-saas-orange hover:text-white"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-gray-400 text-sm">
                  Friends can enter this code during registration
                </p>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-saas-darkGray border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Referral Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <UserPlus className="w-5 h-5 text-saas-orange mr-1" />
                      <span className="text-2xl font-bold text-white">
                        {referralStats?.totalReferrals || 0}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Total Referrals</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Gift className="w-5 h-5 text-green-500 mr-1" />
                      <span className="text-2xl font-bold text-white">
                        ₦{convertUsdToNgn(referralStats?.totalEarnings || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Total Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="mt-12">
          <Card className="bg-saas-darkGray border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReferrals.filter(referral => referral.status === 'qualified' || referral.status === 'rewarded').length > 0 ? (
                  recentReferrals
                    .filter(referral => referral.status === 'qualified' || referral.status === 'rewarded')
                    .map((referral, index) => (
                    <div key={referral.id} className="flex items-center justify-between py-3 border-b border-gray-600">
                      <div>
                        <p className="text-white font-medium">
                          User {referral.referredUserId.slice(-6)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          Joined {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Deposited: ${referral.depositAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-medium">
                          ₦{convertUsdToNgn(referral.rewardAmount).toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm">Completed</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No referrals yet</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Share your referral link with friends to start earning!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileBottomNavigation />
    </div>
  );
};

export default Referrals;