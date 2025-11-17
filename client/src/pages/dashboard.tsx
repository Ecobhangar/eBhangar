// client/src/pages/dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@/components/StatCard";
import { BookingCard } from "@/components/BookingCard";
import { VendorReviews } from "@/components/VendorReviews";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import {
  Package,
  CheckCircle,
  Clock,
  IndianRupee,
  Plus,
  User as UserIcon,
} from "lucide-react";

type CurrentUserResponse = { role: string };

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Logged-in user role
  const { data: currentUser } = useQuery<CurrentUserResponse>({
    queryKey: ["/api/users/me"],
    enabled: !!user,
    queryFn: () => apiRequest("GET", "/api/users/me"),
  });

  // All bookings for user
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
  } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
    queryFn: () => apiRequest("GET", "/api/bookings"),
  });

  // Set correct tab after role loads
  useEffect(() => {
    if (currentUser?.role && !activeTab) {
      setActiveTab(currentUser.role);
    }
  }, [currentUser?.role, activeTab]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

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
              onClick={() => navigate("/profile")}
              className="gap-2"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>

            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {currentUser?.role === "customer" && (
            <TabsList className="grid w-full max-w-md grid-cols-1">
              <TabsTrigger value="customer">My Dashboard</TabsTrigger>
            </TabsList>
          )}

          {/* Customer Dashboard */}
          {currentUser?.role === "customer" && (
            <TabsContent value="customer" className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-green-600">
                    My Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    Track your bookings & earnings
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/book")}
                  className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  size="lg"
                >
                  <Plus className="w-5 h-5" /> New Booking
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Bookings" value={bookings.length} icon={Package} />
                <StatCard
                  title="Pending"
                  value={bookings.filter((b) => b.status === "pending").length}
                  icon={Clock}
                />
                <StatCard
                  title="Completed"
                  value={bookings.filter((b) => b.status === "completed").length}
                  icon={CheckCircle}
                />
                <StatCard
                  title="Scrap Value"
                  value={`₹${totalValue.toFixed(0)}`}
                  icon={IndianRupee}
                />
              </div>

              {/* Bookings list */}
              <div>
                <h2 className="text-xl font-semibold mb-4">My Bookings</h2>

                {bookingsLoading ? (
                  <p>Loading...</p>
                ) : bookings.length === 0 ? (
                  <p>No bookings yet. Click “New Booking”.</p>
                ) : (
                  <div className="grid gap-6">
                    {bookings.map((b) => (
                      <BookingCard
                        key={b.id}
                        id={b.id}
                        referenceId={b.referenceId}
                        customerName={b.customerName}
                        phone={b.customerPhone}
                        address={b.customerAddress}
                        items={b.items.map((i: any) => ({
                          category: i.categoryName,
                          quantity: i.quantity,
                        }))}
                        totalValue={parseFloat(b.totalValue)}
                        paymentMode={b.paymentMode}
                        status={b.status}
                        date={new Date(b.createdAt)}
                        completedAt={b.completedAt ? new Date(b.completedAt) : null}
                        vendorInfo={b.vendor}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Vendor Dashboard */}
          {currentUser?.role === "vendor" && (
            <TabsContent value="vendor" className="space-y-8">
              <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
              <VendorReviews vendorId="demo" />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
