import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { merchantService, type MerchantApplication } from '../services/merchantService';
import { productService, type Product } from '../services/productService';
import { 
  Check, 
  X, 
  Eye, 
  User, 
  Package, 
  Calendar, 
  DollarSign,
  Filter,
  Search,
  Shield,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const [merchantApplications, setMerchantApplications] = useState<MerchantApplication[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<MerchantApplication | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMerchantApplications(merchantService.getAllApplications());
    setPendingProducts(productService.getProductsByStatus('submitted'));
  };

  const handleMerchantAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const decision = action === 'approve' ? 'approved' : 'rejected';
      const result = merchantService.reviewApplication(applicationId, decision, adminNotes, 'admin');
      
      if (result) {
        toast({
          title: action === 'approve' ? "Application Approved" : "Application Rejected",
          description: action === 'approve' 
            ? "Merchant application has been approved successfully."
            : "Merchant application has been rejected.",
          variant: action === 'reject' ? "destructive" : undefined,
        });
      } else {
        throw new Error('Failed to update application');
      }
      
      setAdminNotes('');
      setSelectedApplication(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProductAction = async (productId: string, action: 'approve' | 'reject') => {
    try {
      const decision = action === 'approve' ? 'approved' : 'rejected';
      const result = productService.reviewProduct(productId, decision, adminNotes, 'admin');
      
      if (result) {
        toast({
          title: action === 'approve' ? "Product Approved" : "Product Rejected",
          description: action === 'approve'
            ? "Product has been approved and is now live on the marketplace."
            : "Product has been rejected.",
          variant: action === 'reject' ? "destructive" : undefined,
        });
      } else {
        throw new Error('Failed to update product');
      }
      
      setAdminNotes('');
      setSelectedProduct(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredApplications = merchantApplications.filter(app => {
    const matchesSearch = app.account.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.account.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = pendingProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-500 border-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-500 border-red-500">Rejected</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-saas-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage merchant applications and product submissions</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search merchants or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-saas-darkGray border-gray-700"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-saas-darkGray border border-gray-700 rounded-md text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>

        <Tabs defaultValue="merchants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-saas-darkGray">
            <TabsTrigger value="merchants" className="data-[state=active]:bg-saas-orange">
              Merchant Applications ({merchantApplications.filter(app => app.status === 'submitted').length})
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-saas-orange">
              Product Reviews ({pendingProducts.length})
            </TabsTrigger>
          </TabsList>

          {/* Merchant Applications Tab */}
          <TabsContent value="merchants" className="space-y-4">
            {filteredApplications.length === 0 ? (
              <Card className="bg-saas-darkGray border-gray-700">
                <CardContent className="p-8 text-center">
                  <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No merchant applications found</p>
                </CardContent>
              </Card>
            ) : (
              filteredApplications.map((application) => (
                <Card key={application.id} className="bg-saas-darkGray border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{application.account.businessName}</CardTitle>
                        <p className="text-gray-400 text-sm">{application.account.contactEmail}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(application.status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-saas-darkGray border-gray-700 text-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Merchant Application Review</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Review and approve or reject this merchant application
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApplication && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Business Name</label>
                                    <p className="text-gray-300">{selectedApplication.account.businessName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Business Type</label>
                                    <p className="text-gray-300">{selectedApplication.account.businessType}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Contact Email</label>
                                    <p className="text-gray-300">{selectedApplication.account.contactEmail}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <p className="text-gray-300">{selectedApplication.account.contactPhone}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <label className="text-sm font-medium">Address</label>
                                    <p className="text-gray-300">{selectedApplication.account.businessAddress}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Tax ID</label>
                                    <p className="text-gray-300">{selectedApplication.credentials.taxId}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Payment Method</label>
                                    <p className="text-gray-300">{selectedApplication.payment.method}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Applied</label>
                                    <p className="text-gray-300">
                                      {new Date(selectedApplication.submittedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                  </div>
                                </div>
                                
                                {selectedApplication.status === 'submitted' && (
                                  <div className="space-y-4 pt-4 border-t border-gray-700">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                                      <Textarea
                                        placeholder="Add notes about this application..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="bg-saas-black border-gray-600"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleMerchantAction(selectedApplication.id, 'approve')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="w-4 h-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        onClick={() => handleMerchantAction(selectedApplication.id, 'reject')}
                                        variant="destructive"
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <p className="font-medium">{application.account.businessType}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Payment:</span>
                        <p className="font-medium">{application.payment.method}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Applied:</span>
                        <p className="font-medium">
                          {new Date(application.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Fee:</span>
                        <p className="font-medium text-saas-orange">
                          {formatCurrency(application.payment.amount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Product Reviews Tab */}
          <TabsContent value="products" className="space-y-4">
            {filteredProducts.length === 0 ? (
              <Card className="bg-saas-darkGray border-gray-700">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No products awaiting review</p>
                </CardContent>
              </Card>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="bg-saas-darkGray border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{product.title}</CardTitle>
                        <p className="text-gray-400 text-sm">By {product.seller}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(product.status)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-saas-darkGray border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Product Review</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Review and approve or reject this product submission
                              </DialogDescription>
                            </DialogHeader>
                            {selectedProduct && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Title</label>
                                    <p className="text-gray-300">{selectedProduct.title}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Price</label>
                                    <p className="text-gray-300">{formatCurrency(selectedProduct.price)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <p className="text-gray-300">{selectedProduct.category}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Condition</label>
                                    <p className="text-gray-300 capitalize">{selectedProduct.condition}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Stock</label>
                                    <p className="text-gray-300">{selectedProduct.stockCount} units</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Location</label>
                                    <p className="text-gray-300">{selectedProduct.location}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Description</label>
                                  <p className="text-gray-300">{selectedProduct.description}</p>
                                </div>

                                {selectedProduct.images && selectedProduct.images.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Product Images</label>
                                    <div className="grid grid-cols-3 gap-2">
                                      {selectedProduct.images.map((image, index) => (
                                        <img
                                          key={index}
                                          src={image}
                                          alt={`Product ${index + 1}`}
                                          className="w-full h-24 object-cover rounded-lg"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Tags</label>
                                    <div className="flex flex-wrap gap-1">
                                      {selectedProduct.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {selectedProduct.status === 'submitted' && (
                                  <div className="space-y-4 pt-4 border-t border-gray-700">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                                      <Textarea
                                        placeholder="Add notes about this product..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="bg-saas-black border-gray-600"
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleProductAction(selectedProduct.id, 'approve')}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <Check className="w-4 h-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        onClick={() => handleProductAction(selectedProduct.id, 'reject')}
                                        variant="destructive"
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Category:</span>
                        <p className="font-medium">{product.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Price:</span>
                        <p className="font-medium text-saas-orange">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Stock:</span>
                        <p className="font-medium">{product.stockCount} units</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Submitted:</span>
                        <p className="font-medium">
                          {product.submittedAt ? new Date(product.submittedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{product.description}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}