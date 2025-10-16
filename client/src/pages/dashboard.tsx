import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { BookingCard } from "@/components/BookingCard";
import { VendorCard } from "@/components/VendorCard";
import { VendorReviews } from "@/components/VendorReviews";
import { RatingModal } from "@/components/RatingModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  IndianRupee,
  Plus,
  User as UserIcon,
  Star
} from "lucide-react";

interface BookingItem {
  categoryName: string;
  quantity: number;
}

interface Booking {
  id: string;
  referenceId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  pinCode?: string | null;
  district?: string | null;
  state?: string | null;
  totalValue: string;
  paymentMode: "cash" | "upi";
  paymentStatus: "unpaid" | "paid";
  status: "pending" | "accepted" | "rejected" | "on_the_way" | "completed";
  vendorId?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  completedAt?: string | null;
  items: BookingItem[];
  vendor?: { name: string; phone: string };
}

interface Vendor {
  id: string;
  location: string;
  pinCode?: string | null;
  user: {
    id: string;
    name: string | null;
    phoneNumber: string;
  };
}

function CheckReviewButton({ 
  bookingId, 
  vendorId, 
  onRate 
}: { 
  bookingId: string; 
  vendorId: string; 
  onRate: () => void;
}) {
  const { data: existingReview, isLoading } = useQuery({
    queryKey: ["/api/reviews/booking", bookingId],
  });

  if (isLoading) {
    return <Button variant="outline" disabled className="w-full">Loading...</Button>;
  }

  if (existingReview) {
    return (
      <Button variant="outline" disabled className="w-full" data-testid={`button-review-submitted-${bookingId}`}>
        Review Submitted ✓
      </Button>
    );
  }

  return (
    <Button 
      variant="default" 
      className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
      onClick={onRate}
      data-testid={`button-rate-pickup-${bookingId}`}
    >
      <Star className="w-4 h-4 mr-2 fill-current" />
      Rate This Pickup
    </Button>
  );
}

function AcceptRejectDialog({ 
  bookingId, 
  onAccept,
  onReject 
}: { 
  bookingId: string; 
  onAccept: (paymentMode: "cash" | "upi") => void;
  onReject: (reason: string) => void;
}) {
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi">("cash");
  const [rejectionReason, setRejectionReason] = useState("");

  const handleAccept = () => {
    onAccept(paymentMode);
    setAcceptOpen(false);
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
      setRejectOpen(false);
      setRejectionReason("");
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        data-testid={`button-reject-booking-${bookingId}`}
        variant="outline"
        className="flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        onClick={() => setRejectOpen(true)}
      >
        Reject
      </Button>
      
      <Button 
        data-testid={`button-accept-booking-${bookingId}`}
        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        onClick={() => setAcceptOpen(true)}
      >
        Accept
      </Button>

      {/* Accept Dialog */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent data-testid="dialog-accept-booking">
          <DialogHeader>
            <DialogTitle>Accept Pickup & Collect Payment</DialogTitle>
            <DialogDescription>
              Please select the payment method received from the customer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-mode">Payment Method *</Label>
              <Select value={paymentMode} onValueChange={(value: "cash" | "upi") => setPaymentMode(value)}>
                <SelectTrigger id="payment-mode" data-testid="select-payment-mode-vendor">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select how the customer paid for this pickup
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)} data-testid="button-cancel-accept">
              Cancel
            </Button>
            <Button 
              onClick={handleAccept}
              data-testid="button-confirm-accept"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Accept & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent data-testid="dialog-reject-booking">
          <DialogHeader>
            <DialogTitle>Reject Pickup</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this pickup
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <textarea
                id="rejection-reason"
                data-testid="input-rejection-reason"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} data-testid="button-cancel-reject">
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              data-testid="button-confirm-reject"
              disabled={!rejectionReason.trim()}
              variant="destructive"
            >
              Reject Pickup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("customer");
  const [adminFilter, setAdminFilter] = useState<"all" | "pending" | "completed">("all");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState<{ bookingId: string; vendorId: string } | null>(null);
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: currentUser } = useQuery<{ role: string }>({
    queryKey: ["/api/users/me"],
    enabled: !!user,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
    enabled: !!user && (currentUser?.role === "admin"),
  });

  const { data: currentVendor } = useQuery<{ id: string }>({
    queryKey: ["/api/vendors/me"],
    enabled: !!user && (currentUser?.role === "vendor"),
  });

  const assignVendorMutation = useMutation({
    mutationFn: async ({ bookingId, vendorId }: { bookingId: string; vendorId: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/assign`, { vendorId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Vendor Assigned",
        description: "Vendor has been successfully assigned to the booking",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, paymentMode }: { bookingId: string; status: string; paymentMode?: "cash" | "upi" }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status, paymentMode });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Status Updated",
        description: "Booking status has been updated",
      });
    },
  });

  const rejectBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/reject`, { rejectionReason: reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Rejected",
        description: "Booking has been rejected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject booking",
        variant: "destructive",
      });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await apiRequest("DELETE", `/api/bookings/${bookingId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Deleted",
        description: "Your booking has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/cancel`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await signOut();
    setLocation('/login');
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to cancel this booking? This will return it to pending status.")) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const handleEditBooking = (bookingId: string) => {
    // Navigate to edit page with booking ID
    setLocation(`/bookings/edit/${bookingId}`);
  };

  const customerBookings = bookings.filter(b => b.status !== "completed");
  const completedBookings = bookings.filter(b => b.status === "completed");
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const totalValue = completedBookings.reduce((sum, b) => sum + parseFloat(b.totalValue), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="small" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.phoneNumber}
            </span>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/profile")} 
              data-testid="button-profile"
              className="gap-2"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button variant="ghost" onClick={handleLogout} data-testid="button-logout">Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="customer" data-testid="tab-customer">Customer</TabsTrigger>
            <TabsTrigger value="admin" data-testid="tab-admin">Admin</TabsTrigger>
            <TabsTrigger value="vendor" data-testid="tab-vendor">Vendor</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">My Dashboard</h1>
                <p className="text-muted-foreground mt-1">Track your bookings and earnings</p>
              </div>
              {/* New Booking Button - Always Visible */}
              <Button 
                onClick={() => setLocation("/bookings/new")} 
                data-testid="button-new-booking" 
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                New Booking
              </Button>
            </div>

            {/* Stats Cards with Gradients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard 
                title="Total Bookings" 
                value={bookings.length} 
                icon={Package}
                gradient="from-blue-500 to-cyan-600"
              />
              <StatCard 
                title="Pending" 
                value={pendingBookings.length} 
                icon={Clock}
                gradient="from-amber-500 to-orange-600"
              />
              <StatCard 
                title="Completed" 
                value={completedBookings.length} 
                icon={CheckCircle}
                gradient="from-green-500 to-emerald-600"
              />
              <StatCard 
                title="Total Scrap Value" 
                value={`₹${totalValue.toFixed(0)}`} 
                icon={IndianRupee}
                gradient="from-violet-500 to-purple-600"
              />
            </div>


            <div>
              <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>
              {bookingsLoading ? (
                <p>Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-muted-foreground">No bookings yet. Create your first booking!</p>
              ) : (
                <div className="grid gap-6">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="space-y-4">
                      <BookingCard 
                        id={booking.id}
                        referenceId={booking.referenceId}
                        customerName={booking.customerName}
                        phone={booking.customerPhone}
                        address={booking.customerAddress}
                        items={booking.items.map(item => ({ 
                          category: item.categoryName, 
                          quantity: item.quantity 
                        }))}
                        totalValue={parseFloat(booking.totalValue)}
                        paymentMode={booking.paymentMode}
                        status={booking.status}
                        date={new Date(booking.createdAt)}
                        completedAt={booking.completedAt ? new Date(booking.completedAt) : null}
                        showActions={true}
                        vendorInfo={booking.vendor}
                        onDelete={handleDeleteBooking}
                        onEdit={handleEditBooking}
                        onCancel={handleCancelBooking}
                      />
                      
                      {booking.status === "completed" && booking.vendorId && (
                        <CheckReviewButton 
                          bookingId={booking.id} 
                          vendorId={booking.vendorId}
                          onRate={() => {
                            setSelectedBookingForRating({ bookingId: booking.id, vendorId: booking.vendorId! });
                            setRatingModalOpen(true);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage all bookings and vendors</p>
              </div>
              <Button 
                onClick={() => setLocation("/admin/vendors/onboard")} 
                data-testid="button-onboard-vendor" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                Add Vendor
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard 
                title="Total Bookings" 
                value={bookings.length} 
                icon={Package}
                gradient="from-blue-500 to-cyan-600"
              />
              <StatCard 
                title="Pending" 
                value={pendingBookings.length} 
                icon={Clock}
                gradient="from-amber-500 to-orange-600"
              />
              <StatCard 
                title="Completed" 
                value={completedBookings.length} 
                icon={CheckCircle}
                gradient="from-green-500 to-emerald-600"
              />
              <StatCard 
                title="Total Scrap Value Processed" 
                value={`₹${totalValue.toFixed(0)}`} 
                icon={IndianRupee}
                gradient="from-violet-500 to-purple-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">All Bookings</h2>
                <div className="flex gap-2">
                  <Button
                    variant={adminFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdminFilter("all")}
                    data-testid="button-filter-all"
                  >
                    All
                  </Button>
                  <Button
                    variant={adminFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdminFilter("pending")}
                    data-testid="button-filter-pending"
                  >
                    Pending Only
                  </Button>
                  <Button
                    variant={adminFilter === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdminFilter("completed")}
                    data-testid="button-filter-completed"
                  >
                    Completed Only
                  </Button>
                </div>
              </div>
              {bookingsLoading ? (
                <p>Loading bookings...</p>
              ) : (
                <div className="space-y-4">
                  {bookings.filter(b => {
                    if (adminFilter === "pending") return b.status === "pending";
                    if (adminFilter === "completed") return b.status === "completed";
                    return true;
                  }).map((booking) => {
                    const filteredVendors = booking.pinCode 
                      ? vendors.filter(v => v.pinCode === booking.pinCode)
                      : vendors;
                    
                    return (
                      <BookingCard 
                        key={booking.id} 
                        id={booking.id}
                        referenceId={booking.referenceId}
                        customerName={booking.customerName}
                        phone={booking.customerPhone}
                        address={booking.customerAddress}
                        items={booking.items.map(item => ({ 
                          category: item.categoryName, 
                          quantity: item.quantity 
                        }))}
                        totalValue={parseFloat(booking.totalValue)}
                        paymentMode={booking.paymentMode}
                        status={booking.status}
                        date={new Date(booking.createdAt)}
                        completedAt={booking.completedAt ? new Date(booking.completedAt) : null}
                        isAdmin={true}
                        vendors={filteredVendors.map(v => ({ 
                          id: v.id, 
                          name: v.user.name || v.user.phoneNumber,
                          phone: v.user.phoneNumber
                        }))}
                        vendorInfo={booking.vendor}
                        onAssignVendor={(bookingId, vendorId) => {
                          assignVendorMutation.mutate({ bookingId, vendorId });
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vendor" className="space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Vendor Dashboard
                {currentUser?.role === "admin" && " (Admin View)"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your assigned pickups and earnings.
              </p>
            </div>

            {currentUser?.role === "customer" ? (
              <Card className="p-8">
                <div className="text-center text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Vendor Access Only</h3>
                  <p>This dashboard is only available for vendor and admin accounts.</p>
                </div>
              </Card>
            ) : (
              <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <StatCard 
                title="Assigned Pickups"
                value={bookings.filter(b => 
                  (b.status === "pending" || b.status === "accepted") && b.vendorId && 
                  (currentUser?.role === "admin" || b.vendorId === currentVendor?.id)
                ).length} 
                icon={Package}
                gradient="from-amber-500 to-orange-600"
              />
              <StatCard 
                title="Completed Today"
                value={bookings.filter(b => {
                  if (b.status !== "completed") return false;
                  if (currentUser?.role !== "admin" && b.vendorId !== currentVendor?.id) return false;
                  const today = new Date();
                  const completedDate = new Date(b.completedAt!);
                  return completedDate.toDateString() === today.toDateString();
                }).length} 
                icon={CheckCircle}
                gradient="from-green-500 to-emerald-600"
              />
              <StatCard 
                title="Total Earnings"
                value={`₹${bookings.filter(b => 
                  b.status === "completed" && 
                  (currentUser?.role === "admin" || b.vendorId === currentVendor?.id)
                ).reduce((sum, b) => sum + parseFloat(b.totalValue), 0).toFixed(0)}`} 
                icon={IndianRupee}
                gradient="from-violet-500 to-purple-600"
              />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">
                {currentUser?.role === "admin" ? "All Assigned Pickups" : "Assigned Pickups"}
              </h2>
              <div className="grid gap-6">
                {bookings.filter(b => 
                  (b.status === "pending" || b.status === "accepted") && b.vendorId && 
                  (currentUser?.role === "admin" || b.vendorId === currentVendor?.id)
                ).map((booking) => (
                  <div key={booking.id} className="space-y-2">
                    <BookingCard 
                      id={booking.id}
                      referenceId={booking.referenceId}
                      customerName={booking.customerName}
                      phone={booking.customerPhone}
                      address={booking.customerAddress}
                      items={booking.items.map(item => ({ 
                        category: item.categoryName, 
                        quantity: item.quantity 
                      }))}
                      totalValue={parseFloat(booking.totalValue)}
                      paymentMode={booking.paymentMode}
                      status={booking.status as any}
                      date={new Date(booking.createdAt)}
                      completedAt={booking.completedAt ? new Date(booking.completedAt) : null}
                      vendorInfo={booking.vendor}
                    />
                    {(currentUser?.role === "vendor" || (currentUser?.role === "admin" && currentVendor)) && (
                      <AcceptRejectDialog 
                        bookingId={booking.id}
                        onAccept={(paymentMode) => updateStatusMutation.mutate({ 
                          bookingId: booking.id, 
                          status: "completed",
                          paymentMode 
                        })}
                        onReject={(reason) => rejectBookingMutation.mutate({
                          bookingId: booking.id,
                          reason
                        })}
                      />
                    )}
                  </div>
                ))}
                {bookings.filter(b => 
                  (b.status === "pending" || b.status === "accepted") && b.vendorId && 
                  (currentUser?.role === "admin" || b.vendorId === currentVendor?.id)
                ).length === 0 && (
                  <p className="text-muted-foreground">No assigned pickups</p>
                )}
              </div>
            </div>

              {/* Vendor Reviews Section - Only for actual vendors */}
              {currentUser?.role === "vendor" && currentVendor && (
                <div className="mt-8">
                  <VendorReviews vendorId={currentVendor.id} />
                </div>
              )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Rating Modal */}
      {selectedBookingForRating && (
        <RatingModal
          open={ratingModalOpen}
          onOpenChange={setRatingModalOpen}
          bookingId={selectedBookingForRating.bookingId}
          vendorId={selectedBookingForRating.vendorId}
          onSuccess={() => {
            setSelectedBookingForRating(null);
            queryClient.invalidateQueries({ queryKey: ["/api/reviews/booking", selectedBookingForRating.bookingId] });
          }}
        />
      )}
    </div>
  );
}
