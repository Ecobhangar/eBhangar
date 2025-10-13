import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { QuantitySelector } from "@/components/QuantitySelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Leaf, Check } from "lucide-react";
import { 
  AirVent, 
  Refrigerator, 
  WashingMachine, 
  Shirt, 
  CircuitBoard,
  Trash2,
  FileText,
  BookOpen
} from "lucide-react";

const iconMap: Record<string, any> = {
  AirVent, Refrigerator, WashingMachine, Shirt, CircuitBoard, Trash2, FileText, BookOpen
};

interface CategoryType {
  id: string;
  name: string;
  unit: string;
  minRate: string;
  maxRate: string;
  icon: string;
}

interface SelectedItem {
  categoryId: string;
  categoryName: string;
  quantity: number;
  rate: number;
  value: number;
}

export default function CreateBooking() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/bookings/edit/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  
  const bookingId = params?.id;
  const isEditMode = !!bookingId;
  
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || "");
  const [customerAddress, setCustomerAddress] = useState("");

  const { data: categories = [], isLoading } = useQuery<CategoryType[]>({
    queryKey: ["/api/categories"],
  });

  const { data: existingBooking } = useQuery<any>({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/bookings/${bookingId}`, {});
      return res.json();
    },
    enabled: isEditMode && !!bookingId,
  });

  useEffect(() => {
    if (existingBooking && isEditMode) {
      setCustomerName(existingBooking.customerName || "");
      setCustomerPhone(existingBooking.customerPhone || "");
      setCustomerAddress(existingBooking.customerAddress || "");
      
      const items: Record<string, SelectedItem> = {};
      (existingBooking.items || []).forEach((item: any) => {
        const category = categories.find(c => c.id === item.categoryId);
        if (category) {
          const avgRate = (parseFloat(category.minRate) + parseFloat(category.maxRate)) / 2;
          items[item.categoryId] = {
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            quantity: item.quantity,
            rate: avgRate,
            value: avgRate * item.quantity
          };
        }
      });
      setSelectedItems(items);
    }
  }, [existingBooking, isEditMode, categories]);

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const method = isEditMode ? "PATCH" : "POST";
      const url = isEditMode ? `/api/bookings/${bookingId}` : "/api/bookings";
      const res = await apiRequest(method, url, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: isEditMode ? "Booking Updated" : "Booking Created",
        description: isEditMode ? "Your booking has been updated successfully!" : "Your pickup has been scheduled successfully!",
      });
      
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const toggleCategory = (category: CategoryType) => {
    if (selectedItems[category.id]) {
      const newItems = { ...selectedItems };
      delete newItems[category.id];
      setSelectedItems(newItems);
    } else {
      const avgRate = (parseFloat(category.minRate) + parseFloat(category.maxRate)) / 2;
      setSelectedItems({
        ...selectedItems,
        [category.id]: {
          categoryId: category.id,
          categoryName: category.name,
          quantity: 1,
          rate: avgRate,
          value: avgRate,
        },
      });
    }
  };

  const updateQuantity = (categoryId: string, quantity: number) => {
    if (selectedItems[categoryId]) {
      const item = selectedItems[categoryId];
      setSelectedItems({
        ...selectedItems,
        [categoryId]: {
          ...item,
          quantity,
          value: item.rate * quantity,
        },
      });
    }
  };

  const totalValue = Object.values(selectedItems).reduce((sum, item) => sum + item.value, 0);

  const handleSubmit = () => {
    if (!customerName || !customerPhone || !customerAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(selectedItems).length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      customerName,
      customerPhone,
      customerAddress,
      totalValue,
      items: Object.values(selectedItems),
    });
  };

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
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold font-[Poppins] mb-2">{isEditMode ? "Edit Booking" : "Create New Booking"}</h1>
        <p className="text-muted-foreground mb-8">{isEditMode ? "Update your booking details" : "Select items and schedule your scrap pickup"}</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Select Items</h2>
              {isLoading ? (
                <p>Loading categories...</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const Icon = iconMap[category.icon] || CircuitBoard;
                    const isSelected = !!selectedItems[category.id];
                    
                    return (
                      <Card
                        key={category.id}
                        className={`p-4 cursor-pointer hover-elevate active-elevate-2 ${
                          isSelected ? "border-2 border-primary" : ""
                        }`}
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{category.name}</h3>
                              {isSelected && <Check className="w-5 h-5 text-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ₹{category.minRate}-{category.maxRate}/{category.unit}
                            </p>
                            {isSelected && (
                              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                                <QuantitySelector
                                  value={selectedItems[category.id].quantity}
                                  onChange={(q) => updateQuantity(category.id, q)}
                                  min={1}
                                  max={100}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Details</h2>
              <Card className="p-6 space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2"
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-2"
                    data-testid="input-customer-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Pickup Address *</Label>
                  <Textarea
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Enter complete address"
                    className="mt-2"
                    rows={3}
                    data-testid="input-customer-address"
                  />
                </div>
              </Card>
            </div>
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
              
              {Object.keys(selectedItems).length === 0 ? (
                <p className="text-muted-foreground text-sm">No items selected</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {Object.values(selectedItems).map((item) => (
                    <div key={item.categoryId} className="flex justify-between text-sm">
                      <span>{item.categoryName} x{item.quantity}</span>
                      <span className="font-medium">₹{item.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Value</span>
                  <span className="text-2xl font-bold text-primary">₹{totalValue.toFixed(0)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmit}
                disabled={createBookingMutation.isPending || Object.keys(selectedItems).length === 0}
                data-testid="button-confirm-booking"
              >
                {createBookingMutation.isPending ? "Creating..." : "Confirm Booking"}
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
