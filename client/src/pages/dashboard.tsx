import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { BookingCard } from "@/components/BookingCard";
import { VendorCard } from "@/components/VendorCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  IndianRupee,
  Leaf,
  Plus
} from "lucide-react";

interface BookingItem {
  categoryName: string;
  quantity: number;
}

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalValue: string;
  status: "pending" | "assigned" | "completed";
  createdAt: string;
  items: BookingItem[];
}

interface Vendor {
  id: string;
  location: string;
  user: {
    id: string;
    name: string | null;
    phoneNumber: string;
  };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("customer");
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
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status });
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
          <div className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold font-[Poppins]">eBhangar</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.phoneNumber}
            </span>
            <ThemeToggle />
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold font-[Poppins]">My Dashboard</h1>
                <p className="text-muted-foreground mt-1">Track your bookings and earnings</p>
              </div>
              <Button onClick={() => setLocation("/bookings/new")} data-testid="button-new-booking" className="gap-2">
                <Plus className="w-4 h-4" />
                New Booking
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Bookings" value={bookings.length} icon={Package} />
              <StatCard title="Pending" value={pendingBookings.length} icon={Clock} />
              <StatCard title="Completed" value={completedBookings.length} icon={CheckCircle} />
              <StatCard title="Total Earned" value={`₹${totalValue.toFixed(0)}`} icon={IndianRupee} />
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
                    <BookingCard 
                      key={booking.id} 
                      id={booking.id}
                      customerName={booking.customerName}
                      phone={booking.customerPhone}
                      address={booking.customerAddress}
                      items={booking.items.map(item => ({ 
                        category: item.categoryName, 
                        quantity: item.quantity 
                      }))}
                      totalValue={parseFloat(booking.totalValue)}
                      status={booking.status}
                      date={new Date(booking.createdAt)}
                      showActions={true}
                      onDelete={handleDeleteBooking}
                      onEdit={handleEditBooking}
                      onCancel={handleCancelBooking}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-[Poppins]">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage all bookings and vendors</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Total Bookings" 
                value={bookings.length} 
                icon={Package}
              />
              <StatCard title="Pending" value={pendingBookings.length} icon={Clock} />
              <StatCard title="Completed" value={completedBookings.length} icon={CheckCircle} />
              <StatCard 
                title="Total Revenue" 
                value={`₹${totalValue.toFixed(0)}`} 
                icon={IndianRupee}
              />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">All Bookings</h2>
              {bookingsLoading ? (
                <p>Loading bookings...</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard 
                      key={booking.id} 
                      id={booking.id}
                      customerName={booking.customerName}
                      phone={booking.customerPhone}
                      address={booking.customerAddress}
                      items={booking.items.map(item => ({ 
                        category: item.categoryName, 
                        quantity: item.quantity 
                      }))}
                      totalValue={parseFloat(booking.totalValue)}
                      status={booking.status}
                      date={new Date(booking.createdAt)}
                      isAdmin={true}
                      vendors={vendors.map(v => ({ 
                        id: v.id, 
                        name: v.user.name || v.user.phoneNumber 
                      }))}
                      onAssignVendor={(bookingId, vendorId) => {
                        assignVendorMutation.mutate({ bookingId, vendorId });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vendor" className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-[Poppins]">Vendor Dashboard</h1>
              <p className="text-muted-foreground mt-1">View and manage assigned pickups</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Assigned Pickups" value={bookings.filter(b => b.status === "assigned").length} icon={Package} />
              <StatCard title="Completed Today" value={bookings.filter(b => b.status === "completed").length} icon={CheckCircle} />
              <StatCard title="Today's Earnings" value={`₹${totalValue.toFixed(0)}`} icon={IndianRupee} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Assigned Pickups</h2>
              <div className="grid gap-6">
                {bookings.filter(b => b.status === "assigned").map((booking) => (
                  <div key={booking.id}>
                    <BookingCard 
                      id={booking.id}
                      customerName={booking.customerName}
                      phone={booking.customerPhone}
                      address={booking.customerAddress}
                      items={booking.items.map(item => ({ 
                        category: item.categoryName, 
                        quantity: item.quantity 
                      }))}
                      totalValue={parseFloat(booking.totalValue)}
                      status={booking.status}
                      date={new Date(booking.createdAt)}
                    />
                    <Button 
                      className="mt-2 w-full"
                      onClick={() => updateStatusMutation.mutate({ bookingId: booking.id, status: "completed" })}
                    >
                      Mark as Completed
                    </Button>
                  </div>
                ))}
                {bookings.filter(b => b.status === "assigned").length === 0 && (
                  <p className="text-muted-foreground">No assigned pickups</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
