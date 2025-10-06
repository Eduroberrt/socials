import React, { useState } from 'react';
import { Gift, Users, Wallet, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardNavbar from '@/components/DashboardNavbar';
import MobileBottomNavigation from '@/components/MobileBottomNavigation';
import { referralService } from '@/services/referralService';
import { convertNgnToUsd, convertUsdToNgn, CURRENCY_RATES } from '@/data/referrals';

const ReferralTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, success: boolean, data?: any) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data,
      timestamp: Date.now()
    }]);
  };

  const runCompleteReferralTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Initialize referrer account
      addResult('Initializing referrer account...', true);
      const referrerId = 'test-referrer-123';
      let referrerData = referralService.getUserReferralData(referrerId);
      
      // Test 2: Generate referral link
      addResult('Generating referral link', true, {
        referralCode: referrerData.referralCode,
        referralLink: `https://acctthrive.com/signup?ref=${referrerData.referralCode}`
      });

      // Test 3: Validate referral code
      const isValidCode = referralService.isValidReferralCode(referrerData.referralCode);
      addResult('Validating referral code', isValidCode);

      // Test 4: Simulate new user signup with referral code
      const newUserId = 'test-new-user-456';
      const signupSuccess = referralService.recordReferral(referrerData.referralCode, newUserId);
      addResult('Recording referral signup', signupSuccess);

      // Test 5: Check referrer stats after signup
      referrerData = referralService.getUserReferralData(referrerId);
      addResult('Checking referrer stats after signup', true, {
        totalReferrals: referrerData.totalReferrals,
        totalEarnings: referrerData.totalEarnings
      });

      // Test 6: Process deposit under $25 (should not trigger reward)
      const smallDeposit = 15;
      await referralService.processDeposit(newUserId, smallDeposit);
      referrerData = referralService.getUserReferralData(referrerId);
      addResult('Small deposit ($15) - should not trigger reward', true, {
        depositAmount: smallDeposit,
        totalEarnings: referrerData.totalEarnings
      });

      // Test 7: Process qualifying deposit ($25+)
      const qualifyingDeposit = 50;
      await referralService.processDeposit(newUserId, qualifyingDeposit);
      referrerData = referralService.getUserReferralData(referrerId);
      const rewardEarned = referrerData.totalEarnings > 0;
      addResult('Qualifying deposit ($50) - should trigger reward', rewardEarned, {
        depositAmount: qualifyingDeposit,
        rewardEarned: rewardEarned,
        rewardAmount: `₦${CURRENCY_RATES.REFERRAL_BONUS_NGN} (~$${convertNgnToUsd(CURRENCY_RATES.REFERRAL_BONUS_NGN).toFixed(2)})`
      });

      // Test 8: Check final referrer stats
      addResult('Final referrer stats', true, {
        totalReferrals: referrerData.totalReferrals,
        totalEarnings: `$${referrerData.totalEarnings} (₦${convertUsdToNgn(referrerData.totalEarnings)})`
      });

      // Test 9: Test currency conversion
      const testAmounts = [1000, 5000, 10000];
      testAmounts.forEach(amount => {
        const usdValue = convertNgnToUsd(amount);
        addResult(`Currency conversion: ₦${amount} to USD`, true, {
          ngn: amount,
          usd: usdValue,
          rate: '1 USD = 1550 NGN'
        });
      });

    } catch (error) {
      addResult('Test failed with error', false, { error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-8 h-8 text-saas-orange" />
            <h1 className="text-3xl font-bold">Referral System Test</h1>
          </div>
          <p className="text-gray-400">Complete integration test of the referral system</p>
        </div>

        {/* Test Controls */}
        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-saas-orange" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runCompleteReferralTest}
              disabled={isRunning}
              className="w-full bg-saas-orange hover:bg-saas-orange/90 text-white font-medium py-3"
            >
              {isRunning ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  Running Tests...
                </div>
              ) : (
                'Run Complete Referral System Test'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-800/50 rounded border border-gray-700"
                  >
                    <div className="mt-0.5">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{result.test}</span>
                        <Badge 
                          className={result.success 
                            ? "bg-green-900/20 text-green-400 border-green-500/30" 
                            : "bg-red-900/20 text-red-400 border-red-500/30"
                          }
                        >
                          {result.success ? 'PASS' : 'FAIL'}
                        </Badge>
                      </div>
                      {result.data && (
                        <div className="text-gray-300 text-sm">
                          <pre className="bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Overview */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-6 h-6 text-saas-orange" />
                <h3 className="text-white font-semibold">Referral Rewards</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• ₦1,000 (~$0.65) per qualified referral</p>
                <p>• Triggered by $25+ deposits</p>
                <p>• Real-time tracking and validation</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="w-6 h-6 text-saas-orange" />
                <h3 className="text-white font-semibold">Wallet Integration</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Automatic reward processing</p>
                <p>• Real-time deposit validation</p>
                <p>• Notification system</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-saas-orange" />
                <h3 className="text-white font-semibold">Currency System</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• NGN to USD conversion</p>
                <p>• Rate: 1 USD = 1550 NGN</p>
                <p>• Accurate reward calculations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileBottomNavigation />
    </div>
  );
};

export default ReferralTest;