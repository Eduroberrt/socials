import React, { useState } from 'react';
import { 
  CreditCard, 
  Bitcoin, 
  Wallet, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Upload,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Star,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import DashboardNavbar from '@/components/DashboardNavbar';
import MobileBottomNavigation from '@/components/MobileBottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { merchantService, MerchantApplication } from '@/services/merchantService';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  fee: string;
}

const SellProduct = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [application, setApplication] = useState<MerchantApplication | null>(null);

  // Initialize or get existing application
  React.useEffect(() => {
    if (user?.id) {
      let existingApp = merchantService.getUserApplication(user.id);
      if (!existingApp) {
        existingApp = merchantService.createApplication(user.id);
      }
      setApplication(existingApp);
    }
  }, [user?.id]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Card Payment',
      icon: CreditCard,
      description: 'Pay with your credit or debit card',
      fee: 'Processing fee: $2.99'
    },
    {
      id: 'crypto',
      name: 'Crypto Deposit',
      icon: Bitcoin,
      description: 'Pay with Bitcoin or other cryptocurrencies',
      fee: 'Network fee: ~$1.50'
    },
    {
      id: 'wallet',
      name: 'Wallet Balance',
      icon: Wallet,
      description: 'Use your existing wallet balance',
      fee: 'No additional fees'
    }
  ];

  const slides = [
    { title: 'Make Payment', key: 'payment' },
    { title: 'Add Account', key: 'account' },
    { title: 'Credentials', key: 'credentials' },
    { title: 'Review', key: 'review' }
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    if (!application) return;
    
    const updatedApp = merchantService.updateApplication(application.id, {
      payment: { ...application.payment, method: methodId }
    });
    if (updatedApp) setApplication(updatedApp);
  };

  const handlePaymentProcess = async () => {
    if (!application) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await merchantService.processPayment(application.id, application.payment.method);
      
      if (result.success) {
        const updatedApp = merchantService.getUserApplication(application.userId);
        if (updatedApp) setApplication(updatedApp);
        setCurrentSlide(1);
      } else {
        // Handle payment failure
        alert(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      alert('Payment processing error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountUpdate = (field: string, value: string) => {
    if (!application) return;
    
    const updatedApp = merchantService.updateApplication(application.id, {
      account: { ...application.account, [field]: value }
    });
    if (updatedApp) setApplication(updatedApp);
  };

  const handleCredentialsUpdate = (field: string, value: string | File | null) => {
    if (!application) return;
    
    const updatedApp = merchantService.updateApplication(application.id, {
      credentials: { ...application.credentials, [field]: value }
    });
    if (updatedApp) setApplication(updatedApp);
  };

  const handleFileUpload = (field: string, file: File) => {
    handleCredentialsUpdate(field, file);
  };

  const isSlideComplete = (slideIndex: number): boolean => {
    if (!application) return false;
    
    switch (slideIndex) {
      case 0: // Payment
        return application.payment.status === 'completed';
      case 1: // Account
        const account = application.account;
        return !!(account.businessName && account.businessType && account.contactEmail && account.contactPhone);
      case 2: // Credentials
        const creds = application.credentials;
        return !!(creds.taxId && creds.bankAccount && creds.businessLicense && creds.identityDocument);
      default:
        return false;
    }
  };

  const canProceedToNext = (slideIndex: number): boolean => {
    if (!application) return false;
    if (slideIndex === 0) return application.payment.method !== '';
    return isSlideComplete(slideIndex);
  };

  const handleNextSlide = () => {
    if (!application) return;
    
    if (currentSlide === 0 && application.payment.method) {
      handlePaymentProcess();
    } else if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSubmitApplication = async () => {
    if (!application) return;
    
    setIsSubmitting(true);
    
    try {
      const submittedApp = merchantService.submitApplication(application.id);
      if (submittedApp) {
        setApplication(submittedApp);
      }
    } catch (error) {
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {slides.map((slide, index) => (
          <div key={slide.key} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentSlide ? 'bg-green-500 text-white' :
                index === currentSlide ? 'bg-saas-orange text-white' :
                'bg-gray-600 text-gray-300'
              }`}
            >
              {index < currentSlide ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < slides.length - 1 && (
              <div 
                className={`w-16 h-1 mx-2 ${
                  index < currentSlide ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm">
        {slides.map((slide, index) => (
          <span 
            key={slide.key}
            className={`${
              index <= currentSlide ? 'text-white' : 'text-gray-400'
            }`}
          >
            {slide.title}
          </span>
        ))}
      </div>
    </div>
  );

  const renderPaymentSlide = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Become a Merchant</h2>
        <p className="text-gray-400">
          A one-time payment is required to complete your merchant registration.
        </p>
        <div className="mt-4 p-4 bg-saas-orange/10 border border-saas-orange/20 rounded-lg">
          <p className="text-saas-orange font-semibold">Registration Fee: $100.00</p>
        </div>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = application.payment.method === method.id;
          
          return (
            <Card 
              key={method.id}
              className={`cursor-pointer transition-all border-2 ${
                isSelected 
                  ? 'border-saas-orange bg-saas-orange/5' 
                  : 'border-gray-600 hover:border-gray-500 bg-gray-900'
              }`}
              onClick={() => handlePaymentMethodSelect(method.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? 'bg-saas-orange text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{method.name}</h3>
                    <p className="text-gray-400 text-sm">{method.description}</p>
                    <p className="text-saas-orange text-xs mt-1">{method.fee}</p>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-saas-orange" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderAccountSlide = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Business Account Details</h2>
        <p className="text-gray-400">
          Provide your business information for merchant verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="businessName" className="text-white">Business Name *</Label>
          <Input
            id="businessName"
            value={application.account.businessName}
            onChange={(e) => handleAccountUpdate('businessName', e.target.value)}
            className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            placeholder="Your Business Name"
          />
        </div>

        <div>
          <Label htmlFor="businessType" className="text-white">Business Type *</Label>
          <Input
            id="businessType"
            value={application.account.businessType}
            onChange={(e) => handleAccountUpdate('businessType', e.target.value)}
            className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            placeholder="e.g., E-commerce, Services"
          />
        </div>

        <div>
          <Label htmlFor="contactEmail" className="text-white">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={application.account.contactEmail}
            onChange={(e) => handleAccountUpdate('contactEmail', e.target.value)}
            className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            placeholder="business@example.com"
          />
        </div>

        <div>
          <Label htmlFor="contactPhone" className="text-white">Contact Phone *</Label>
          <Input
            id="contactPhone"
            value={application.account.contactPhone}
            onChange={(e) => handleAccountUpdate('contactPhone', e.target.value)}
            className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="businessAddress" className="text-white">Business Address</Label>
          <Input
            id="businessAddress"
            value={application.account.businessAddress}
            onChange={(e) => handleAccountUpdate('businessAddress', e.target.value)}
            className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            placeholder="Full business address"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="businessDescription" className="text-white">Business Description</Label>
          <Textarea
            id="businessDescription"
            value={application.account.businessDescription}
            onChange={(e) => handleAccountUpdate('businessDescription', e.target.value)}
            className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            placeholder="Describe your business and what you sell..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderCredentialsSlide = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Business Credentials</h2>
        <p className="text-gray-400">
          Upload required documents and provide business credentials for verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="taxId" className="text-white">Tax ID / EIN *</Label>
          <Input
            id="taxId"
            value={application.credentials.taxId}
            onChange={(e) => handleCredentialsUpdate('taxId', e.target.value)}
            className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            placeholder="XX-XXXXXXX"
          />
        </div>

        <div>
          <Label htmlFor="bankAccount" className="text-white">Bank Account Number *</Label>
          <Input
            id="bankAccount"
            value={application.credentials.bankAccount}
            onChange={(e) => handleCredentialsUpdate('bankAccount', e.target.value)}
            className="mt-1 bg-gray-800/50 border-gray-600 text-white"
            placeholder="Account number for payments"
          />
        </div>

        <div className="md:col-span-2">
          <Label className="text-white">Business License *</Label>
          <div className="mt-2 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 mb-2">Upload your business license</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('businessLicense', file);
              }}
              className="hidden"
              id="businessLicense"
            />
            <Button
              onClick={() => document.getElementById('businessLicense')?.click()}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              Choose File
            </Button>
            {application.credentials.businessLicense && (
              <p className="text-green-400 mt-2 text-sm">
                ✓ {application.credentials.businessLicense.name}
              </p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <Label className="text-white">Identity Document *</Label>
          <div className="mt-2 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400 mb-2">Upload government-issued ID</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('identityDocument', file);
              }}
              className="hidden"
              id="identityDocument"
            />
            <Button
              onClick={() => document.getElementById('identityDocument')?.click()}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              Choose File
            </Button>
            {application.credentials.identityDocument && (
              <p className="text-green-400 mt-2 text-sm">
                ✓ {application.credentials.identityDocument.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewSlide = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Review Application</h2>
        <p className="text-gray-400">
          Please review your information before submitting for admin approval.
        </p>
      </div>

      <div className="space-y-6">
        {/* Payment Summary */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-saas-orange" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Method:</span>
              <span className="text-white capitalize">{application.payment.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="text-white">${application.payment.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <Badge className="bg-green-500 text-white">Completed</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Summary */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-saas-orange" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Business Name:</span>
              <span className="text-white">{application.account.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Business Type:</span>
              <span className="text-white">{application.account.businessType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contact Email:</span>
              <span className="text-white">{application.account.contactEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Contact Phone:</span>
              <span className="text-white">{application.account.contactPhone}</span>
            </div>
          </CardContent>
        </Card>

        {/* Credentials Summary */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-saas-orange" />
              Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Tax ID:</span>
              <span className="text-white">{application.credentials.taxId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bank Account:</span>
              <span className="text-white">****{application.credentials.bankAccount.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Business License:</span>
              <span className="text-green-400">✓ Uploaded</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Identity Document:</span>
              <span className="text-green-400">✓ Uploaded</span>
            </div>
          </CardContent>
        </Card>

        {application.status === 'submitted' ? (
          <Card className="bg-green-900/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">Application Submitted!</h3>
              <p className="text-gray-300 mb-4">
                Your merchant application has been submitted for admin review.
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Review typically takes 2-3 business days</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>Note:</strong> After submission, your application will be reviewed by our admin team. 
              You'll receive an email notification once the review is complete.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (!application) {
    return (
      <div className="min-h-screen bg-saas-black">
        <DashboardNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-white">Loading...</div>
        </div>
        <MobileBottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saas-black">
      <DashboardNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {renderProgressBar()}
        
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-8">
            {currentSlide === 0 && renderPaymentSlide()}
            {currentSlide === 1 && renderAccountSlide()}
            {currentSlide === 2 && renderCredentialsSlide()}
            {currentSlide === 3 && renderReviewSlide()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentSlide < slides.length - 1 ? (
            <Button
              onClick={handleNextSlide}
              disabled={!canProceedToNext(currentSlide) || isSubmitting}
              className="bg-saas-orange hover:bg-saas-orange/90 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  Processing...
                </div>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmitApplication}
              disabled={application.status === 'submitted' || isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  Submitting...
                </div>
              ) : application.status === 'submitted' ? (
                'Application Submitted'
              ) : (
                'Submit for Review'
              )}
            </Button>
          )}
        </div>
      </div>

      <MobileBottomNavigation />
    </div>
  );
};

export default SellProduct;