import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { BookingCard } from "@/components/BookingCard";
import { VendorCard } from "@/components/VendorCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  IndianRupee,
  Leaf,
  Plus
} from "lucide-react";

const mockBookings = [
  {
    id: "1",
    customerName: "Rahul Sharma",
    phone: "+91 98765 43210",
    address: "123, MG Road, Bangalore",
    items: [
      { category: "Old AC", quantity: 2 },
      { category: "Refrigerator", quantity: 1 }
    ],
    totalValue: 3500,
    status: "pending" as const,
    date: new Date()
  },
  {
    id: "2",
    customerName: "Priya Patel",
    phone: "+91 98765 43211",
    address: "456, Koramangala, Bangalore",
    items: [
      { category: "Paper", quantity: 50 },
      { category: "Books", quantity: 20 }
    ],
    totalValue: 1200,
    status: "assigned" as const,
    date: new Date(Date.now() - 86400000)
  },
  {
    id: "3",
    customerName: "Amit Kumar",
    phone: "+91 98765 43212",
    address: "789, Indiranagar, Bangalore",
    items: [
      { category: "Copper", quantity: 5 },
      { category: "Iron", quantity: 3 }
    ],
    totalValue: 2800,
    status: "completed" as const,
    date: new Date(Date.now() - 172800000)
  }
];

const mockVendors = [
  {
    id: "1",
    name: "Vikram Kabadiwala",
    phone: "+91 99999 11111",
    location: "Indiranagar, Bangalore"
  },
  {
    id: "2",
    name: "Suresh Scrap Services",
    phone: "+91 99999 22222",
    location: "Koramangala, Bangalore"
  }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("customer");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold font-[Poppins]">eBhangar</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" data-testid="button-logout">Logout</Button>
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
              <Button data-testid="button-new-booking">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Bookings" value="3" icon={Package} />
              <StatCard title="Pending" value="1" icon={Clock} />
              <StatCard title="Completed" value="1" icon={CheckCircle} />
              <StatCard title="Total Earned" value="₹2,800" icon={IndianRupee} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">My Bookings</h2>
              <div className="grid gap-6">
                {mockBookings.map((booking) => (
                  <BookingCard key={booking.id} {...booking} />
                ))}
              </div>
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
                value="248" 
                icon={Package}
                trend={{ value: "12% from last month", positive: true }}
              />
              <StatCard title="Pending" value="12" icon={Clock} />
              <StatCard title="Completed" value="236" icon={CheckCircle} />
              <StatCard 
                title="Total Revenue" 
                value="₹4.2L" 
                icon={IndianRupee}
                trend={{ value: "8% from last month", positive: true }}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold mb-6">All Bookings</h2>
                <div className="space-y-4">
                  {mockBookings.map((booking) => (
                    <BookingCard key={booking.id} {...booking} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">Available Vendors</h2>
                <div className="space-y-4">
                  {mockVendors.map((vendor) => (
                    <VendorCard 
                      key={vendor.id} 
                      {...vendor}
                      onAssign={() => console.log(`Assigning vendor ${vendor.id}`)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vendor" className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold font-[Poppins]">Vendor Dashboard</h1>
              <p className="text-muted-foreground mt-1">View and manage assigned pickups</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Assigned Pickups" value="5" icon={Package} />
              <StatCard title="Completed Today" value="3" icon={CheckCircle} />
              <StatCard title="Today's Earnings" value="₹8,500" icon={IndianRupee} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Assigned Pickups</h2>
              <div className="grid gap-6">
                {mockBookings.filter(b => b.status === "assigned").map((booking) => (
                  <BookingCard key={booking.id} {...booking} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
