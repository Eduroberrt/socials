import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Gift } from 'lucide-react';
import PhoneInput from '@/components/PhoneInput';
import { referralService } from '@/services/referralService';
import { CURRENCY_RATES } from '@/data/referrals';
import { useAuth } from '@/contexts/AuthContext';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, isLoading } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    consent: false
  });

  // Check for referral code in URL on component mount
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      validateReferralCode(refCode);
    }
  }, [searchParams]);

  const validateReferralCode = (code: string) => {
    if (!code.trim()) {
      setReferralValid(null);
      return;
    }
    
    const isValid = referralService.isValidReferralCode(code);
    setReferralValid(isValid);
  };

  const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setReferralCode(code);
    validateReferralCode(code);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (!formData.consent) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (!formData.username || !formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Sign up user with auth context
      const result = await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.first_name,
        last_name: formData.last_name,
        referral_code: referralCode || undefined
      });

      if (result.success) {
        // Create new user ID for referral system
        const newUserId = `user_${Date.now()}`;
        
        // Handle referral if code is provided and valid
        if (referralCode && referralValid) {
          const referralSuccess = referralService.recordReferral(referralCode, newUserId);
          if (referralSuccess) {
            console.log(`User ${newUserId} signed up with referral code: ${referralCode}`);
          }
        }
        
        // Initialize user's own referral system
        referralService.initializeUserReferral(newUserId);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-saas-black flex">
      {/* Left Column - Image with Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/signup-image.PNG')`,
          }}
        >
          {/* Fallback gradient if image doesn't load */}
          <div className="absolute inset-0 bg-gradient-to-br from-saas-orange/30 to-saas-black/80"></div>
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-8 w-full text-white">
          {/* Logo at top left */}
          <div>
            <Link to="/" className="text-2xl font-bold text-saas-orange">
              Acctthrive
            </Link>
          </div>
          
          {/* Header and Description at bottom */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Join the Future of
              <span className="block bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Digital Commerce
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-md">
              Connect with thousands of verified sellers and discover authentic accounts in our trusted marketplace.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-saas-black">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className="text-3xl font-bold text-saas-orange">
              Acctthrive
            </Link>
          </div>

          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-gray-400">Join our marketplace community today</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-white">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleInputChange}
                className="bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange"
                placeholder="Enter your first name"
                required
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-white">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                className="bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange"
                placeholder="Enter your last name"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
              <PhoneInput
                value={formData.phoneNumber}
                onChange={(value) => setFormData(prev => ({ ...prev, phoneNumber: value }))}
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* Referral Code */}
            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-white flex items-center">
                <Gift className="w-4 h-4 mr-2 text-saas-orange" />
                Referral Code (Optional)
              </Label>
              <Input
                id="referralCode"
                name="referralCode"
                type="text"
                value={referralCode}
                onChange={handleReferralCodeChange}
                className={`bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange ${
                  referralValid === true ? 'border-green-500' : 
                  referralValid === false ? 'border-red-500' : ''
                }`}
                placeholder="Enter referral code"
              />
              {referralValid === true && (
                <p className="text-green-500 text-sm flex items-center">
                  <Gift className="w-3 h-3 mr-1" />
                  Valid referral code! Your referrer will earn ₦{CURRENCY_RATES.REFERRAL_BONUS_NGN.toLocaleString()} when you deposit $25+
                </p>
              )}
              {referralValid === false && (
                <p className="text-red-500 text-sm">Invalid referral code</p>
              )}
              {referralCode && referralValid === null && (
                <p className="text-gray-400 text-sm">Checking referral code...</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange pr-10"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                name="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, consent: checked as boolean }))
                }
                className="border-gray-600 data-[state=checked]:bg-saas-orange data-[state=checked]:border-saas-orange mt-1"
              />
              <Label htmlFor="consent" className="text-sm text-gray-300 leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-saas-orange hover:text-orange-400 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-saas-orange hover:text-orange-400 underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!formData.consent || isLoading}
              className="w-full bg-saas-orange hover:bg-orange-600 text-white font-semibold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-saas-orange hover:text-orange-400 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;