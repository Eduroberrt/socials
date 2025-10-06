import { 
  ReferralData, 
  ReferralRecord, 
  ReferralStats,
  generateReferralCode,
  generateReferralLink,
  getReferralBonusUsd,
  CURRENCY_RATES
} from '../data/referrals';

// Mock referral service - in real app, these would be API calls
class ReferralService {
  private referralData: Map<string, ReferralData> = new Map();
  private referralRecords: ReferralRecord[] = [];
  private userReferralCodes: Map<string, string> = new Map();

  // Initialize user's referral data
  initializeUserReferral(userId: string): ReferralData {
    if (this.referralData.has(userId)) {
      return this.referralData.get(userId)!;
    }

    const referralCode = generateReferralCode(userId);
    const referralLink = generateReferralLink(referralCode);
    
    const referralData: ReferralData = {
      id: `ref_${Date.now()}_${userId}`,
      userId,
      referralCode,
      referralLink,
      totalReferrals: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      createdAt: new Date()
    };

    this.referralData.set(userId, referralData);
    this.userReferralCodes.set(referralCode, userId);
    
    return referralData;
  }

  // Get user's referral data
  getUserReferralData(userId: string): ReferralData | null {
    return this.referralData.get(userId) || null;
  }

  // Record a new referral (when someone signs up with a code)
  recordReferral(referralCode: string, newUserId: string): boolean {
    const referrerId = this.userReferralCodes.get(referralCode);
    
    if (!referrerId || referrerId === newUserId) {
      return false; // Invalid code or self-referral
    }

    const referralRecord: ReferralRecord = {
      id: `rec_${Date.now()}_${newUserId}`,
      referrerId,
      referredUserId: newUserId,
      referralCode,
      status: 'pending',
      depositAmount: 0,
      rewardAmount: 0,
      createdAt: new Date()
    };

    this.referralRecords.push(referralRecord);
    
    // Update referrer's total referrals
    const referrerData = this.referralData.get(referrerId);
    if (referrerData) {
      referrerData.totalReferrals++;
      this.referralData.set(referrerId, referrerData);
    }

    return true;
  }

  // Process deposit and check for referral qualification
  processDeposit(userId: string, depositAmount: number): boolean {
    const referralRecord = this.referralRecords.find(
      r => r.referredUserId === userId && r.status === 'pending'
    );

    if (!referralRecord) {
      return false; // No pending referral found
    }

    referralRecord.depositAmount += depositAmount;

    // Check if deposit meets minimum requirement
    if (referralRecord.depositAmount >= CURRENCY_RATES.MINIMUM_DEPOSIT_USD) {
      return this.qualifyReferral(referralRecord);
    }

    return false;
  }

  // Qualify referral and award bonus
  private qualifyReferral(referralRecord: ReferralRecord): boolean {
    const bonusAmount = getReferralBonusUsd();
    
    referralRecord.status = 'qualified';
    referralRecord.rewardAmount = bonusAmount;
    referralRecord.qualifiedAt = new Date();

    // Add bonus to referrer's wallet (in real app, this would update the actual wallet)
    const referrerData = this.referralData.get(referralRecord.referrerId);
    if (referrerData) {
      referrerData.totalEarnings += bonusAmount;
      referrerData.pendingEarnings += bonusAmount;
      this.referralData.set(referralRecord.referrerId, referrerData);
    }

    // In real app, you would:
    // 1. Add the bonus to the user's actual wallet
    // 2. Send notification to the referrer
    // 3. Log the transaction
    
    console.log(`Referral qualified! ${referralRecord.referrerId} earned $${bonusAmount} for referring ${referralRecord.referredUserId}`);
    
    return true;
  }

  // Get referral stats for a user
  getReferralStats(userId: string): ReferralStats {
    const userRecords = this.referralRecords.filter(r => r.referrerId === userId);
    
    return {
      totalReferrals: userRecords.length,
      qualifiedReferrals: userRecords.filter(r => r.status === 'qualified' || r.status === 'rewarded').length,
      pendingReferrals: userRecords.filter(r => r.status === 'pending').length,
      totalEarnings: userRecords.reduce((sum, r) => sum + r.rewardAmount, 0),
      pendingEarnings: userRecords.filter(r => r.status === 'qualified').reduce((sum, r) => sum + r.rewardAmount, 0)
    };
  }

  // Get recent referrals for a user
  getRecentReferrals(userId: string, limit: number = 10): ReferralRecord[] {
    return this.referralRecords
      .filter(r => r.referrerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Validate referral code
  isValidReferralCode(code: string): boolean {
    return this.userReferralCodes.has(code);
  }

  // Get referrer ID by code
  getReferrerByCode(code: string): string | null {
    return this.userReferralCodes.get(code) || null;
  }
}

// Export singleton instance
export const referralService = new ReferralService();

// Initialize some mock data for testing
const mockUserId = 'user_123';
referralService.initializeUserReferral(mockUserId);

// Create some mock referral records
const mockReferralData = referralService.getUserReferralData(mockUserId);
if (mockReferralData) {
  // Simulate some referrals
  referralService.recordReferral(mockReferralData.referralCode, 'user_456');
  referralService.recordReferral(mockReferralData.referralCode, 'user_789');
  referralService.recordReferral(mockReferralData.referralCode, 'user_101');
  
  // Simulate deposits that qualify for rewards
  referralService.processDeposit('user_456', 50); // Qualifies
  referralService.processDeposit('user_789', 30); // Qualifies
  referralService.processDeposit('user_101', 15); // Doesn't qualify yet
}