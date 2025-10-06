// Referral system types and interfaces
export interface ReferralData {
  id: string;
  userId: string;
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarnings: number; // in USD
  pendingEarnings: number; // in USD
  createdAt: Date;
}

export interface ReferralRecord {
  id: string;
  referrerId: string; // User who referred
  referredUserId: string; // User who was referred
  referralCode: string;
  status: 'pending' | 'qualified' | 'rewarded';
  depositAmount: number; // in USD
  rewardAmount: number; // in USD
  createdAt: Date;
  qualifiedAt?: Date;
  rewardedAt?: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number; // in USD
  pendingEarnings: number; // in USD
}

// Currency conversion rates (in real app, this would come from an API)
export const CURRENCY_RATES = {
  NGN_TO_USD: 1550, // 1 USD = 1550 NGN (approximate)
  REFERRAL_BONUS_NGN: 1000,
  MINIMUM_DEPOSIT_USD: 25
};

// Convert NGN to USD
export const convertNgnToUsd = (ngnAmount: number): number => {
  return Number((ngnAmount / CURRENCY_RATES.NGN_TO_USD).toFixed(2));
};

// Convert USD to NGN
export const convertUsdToNgn = (usdAmount: number): number => {
  return Math.round(usdAmount * CURRENCY_RATES.NGN_TO_USD);
};

// Get referral bonus in USD
export const getReferralBonusUsd = (): number => {
  return convertNgnToUsd(CURRENCY_RATES.REFERRAL_BONUS_NGN);
};

// Generate unique referral code
export const generateReferralCode = (userId: string): string => {
  const prefix = userId.substring(0, 2).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Generate referral link
export const generateReferralLink = (referralCode: string): string => {
  return `${window.location.origin}/signup?ref=${referralCode}`;
};