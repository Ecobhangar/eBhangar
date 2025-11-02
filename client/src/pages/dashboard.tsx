import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { BookingCard } from "@/components/BookingCard";
import { VendorReviews } from "@/components/VendorReviews";
import { RatingModal } from "@/components/RatingModal";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, CheckCircle, Clock, IndianRupee, Plus, User as UserIcon } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("");
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: currentUser } = useQuery<{ role: string }>({
    queryKey: ["/api/users/me"],
    enabled: !!user,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    await signOut();
    setLocation("/login");
  };

  useEffect(() => {
    if (currentUser?.role && !activeTab) setActiveTab(currentUser.role);
  }, [currentUser?.role, activeTab]);

  const totalValue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + parseFloat(b.totalValue), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              className="gap-2"
              data-testid="button-profile"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v)}
          className="space-y-8"
        >
          {/* Tabs based on role */}
          {currentUser?.role === "customer" && (
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="customer">My Dashboard</TabsTrigger>
            </TabsList>
          )}
          {currentUser?.role === "admin" && (
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
            </TabsList>
          )}
          {currentUser?.role === "vendor" && (
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="vendor">Vendor Dashboard</TabsTrigger>
            </TabsList>
          )}

          {/* Customer Dashboard */}
          {currentUser?.role === "customer" && (
            <TabsContent value="customer" className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    My Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Track your bookings and earnings
                  </p>
                </div>

                {/* ✅ Fixed: Correct booking path */}
                <Button
                  onClick={() => setLocation("/book")}
                  data-testid="button-new-booking"
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                  New Booking
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                  title="Total Bookings"
                  value={bookings.length}
                  icon={Package}
                  gradient="from-blue-500 to-cyan-600"
                />
                <StatCard
                  title="Pending"
                  value={bookings.filter((b) => b.status === "pending").length}
                  icon={Clock}
                  gradient="from-amber-500 to-orange-600"
                />
                <StatCard
                  title="Completed"
                  value={bookings.filter((b) => b.status === "completed").length}
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

              {/* Bookings */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>
                {bookingsLoading ? (
                  <p>Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-muted-foreground">
                    No bookings yet. Create your first booking!
                  </p>
                ) : (
                  <div className="grid gap-6">
                    {bookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        id={booking.id}
                        referenceId={booking.referenceId}
                        customerName={booking.customerName}
                        phone={booking.customerPhone}
                        address={booking.customerAddress}
                        items={booking.items.map((item: any) => ({
                          category: item.categoryName,
                          quantity: item.quantity,
                        }))}
                        totalValue={parseFloat(booking.totalValue)}
                        paymentMode={booking.paymentMode}
                        status={booking.status}
                        date={new Date(booking.createdAt)}
                        completedAt={
                          booking.completedAt
                            ? new Date(booking.completedAt)
                            : null
                        }
                        vendorInfo={booking.vendor}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Admin or Vendor dashboards can be added later */}
          {currentUser?.role === "vendor" && (
            <TabsContent value="vendor" className="space-y-8">
              <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
              <p className="text-muted-foreground">
                Vendor-specific features will appear here.
              </p>
              <VendorReviews vendorId="demo" />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
