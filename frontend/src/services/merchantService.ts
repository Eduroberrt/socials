// Merchant Application Management Service

// Utility function for generating IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface MerchantApplication {
  id: string;
  userId: string;
  payment: {
    method: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
    paidAt?: Date;
  };
  account: {
    businessName: string;
    businessType: string;
    contactEmail: string;
    contactPhone: string;
    businessAddress: string;
    businessDescription: string;
  };
  credentials: {
    businessLicense: File | null;
    taxId: string;
    bankAccount: string;
    identityDocument: File | null;
  };
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class MerchantService {
  private applications: Map<string, MerchantApplication> = new Map();
  private userApplications: Map<string, string> = new Map(); // userId -> applicationId

  // Initialize with some mock data
  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('merchant_applications');
      if (stored) {
        const data = JSON.parse(stored);
        this.applications = new Map(data.applications || []);
        this.userApplications = new Map(data.userApplications || []);
      }
    } catch (error) {
      console.error('Error loading merchant applications:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        applications: Array.from(this.applications.entries()),
        userApplications: Array.from(this.userApplications.entries())
      };
      localStorage.setItem('merchant_applications', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving merchant applications:', error);
    }
  }

  // Create new application
  createApplication(userId: string): MerchantApplication {
    const applicationId = generateId('app');
    const application: MerchantApplication = {
      id: applicationId,
      userId,
      payment: {
        method: '',
        amount: 100,
        status: 'pending'
      },
      account: {
        businessName: '',
        businessType: '',
        contactEmail: '',
        contactPhone: '',
        businessAddress: '',
        businessDescription: ''
      },
      credentials: {
        businessLicense: null,
        taxId: '',
        bankAccount: '',
        identityDocument: null
      },
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.applications.set(applicationId, application);
    this.userApplications.set(userId, applicationId);
    this.saveToStorage();
    
    return application;
  }

  // Get application by user ID
  getUserApplication(userId: string): MerchantApplication | null {
    const applicationId = this.userApplications.get(userId);
    if (!applicationId) return null;
    return this.applications.get(applicationId) || null;
  }

  // Update application
  updateApplication(applicationId: string, updates: Partial<MerchantApplication>): MerchantApplication | null {
    const application = this.applications.get(applicationId);
    if (!application) return null;

    const updatedApplication = {
      ...application,
      ...updates,
      updatedAt: new Date()
    };

    this.applications.set(applicationId, updatedApplication);
    this.saveToStorage();
    
    return updatedApplication;
  }

  // Process payment
  async processPayment(applicationId: string, method: string): Promise<PaymentResult> {
    const application = this.applications.get(applicationId);
    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different payment methods
    let success = true;
    let transactionId = generateId('txn');

    // Simulate some failures for demo
    if (Math.random() < 0.1) { // 10% failure rate
      success = false;
    }

    if (success) {
      this.updateApplication(applicationId, {
        payment: {
          ...application.payment,
          method,
          status: 'completed',
          transactionId,
          paidAt: new Date()
        }
      });
      
      return { success: true, transactionId };
    } else {
      this.updateApplication(applicationId, {
        payment: {
          ...application.payment,
          method,
          status: 'failed'
        }
      });
      
      return { success: false, error: 'Payment failed. Please try again.' };
    }
  }

  // Submit application for review
  submitApplication(applicationId: string): MerchantApplication | null {
    const application = this.applications.get(applicationId);
    if (!application) return null;

    const updatedApplication = this.updateApplication(applicationId, {
      status: 'submitted',
      submittedAt: new Date()
    });

    // In a real app, this would trigger admin notification
    console.log('Application submitted for review:', applicationId);

    return updatedApplication;
  }

  // Admin functions
  getAllApplications(): MerchantApplication[] {
    return Array.from(this.applications.values())
      .sort((a, b) => b.submittedAt?.getTime() || 0 - (a.submittedAt?.getTime() || 0));
  }

  getPendingApplications(): MerchantApplication[] {
    return this.getAllApplications().filter(app => 
      app.status === 'submitted' || app.status === 'under-review'
    );
  }

  // Admin review application
  reviewApplication(applicationId: string, decision: 'approved' | 'rejected', reviewNotes?: string, reviewerId?: string): MerchantApplication | null {
    const application = this.applications.get(applicationId);
    if (!application) return null;

    const updatedApplication = this.updateApplication(applicationId, {
      status: decision,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      reviewNotes
    });

    // In a real app, this would trigger user notification
    console.log(`Application ${decision}:`, applicationId);

    return updatedApplication;
  }

  // Check if user is approved merchant
  isApprovedMerchant(userId: string): boolean {
    const application = this.getUserApplication(userId);
    return application?.status === 'approved' || false;
  }

  // Get merchant stats
  getMerchantStats() {
    const applications = this.getAllApplications();
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'submitted').length,
      underReview: applications.filter(app => app.status === 'under-review').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  }
}

export const merchantService = new MerchantService();