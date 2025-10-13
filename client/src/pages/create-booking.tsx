import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Leaf, Plus, Trash2 } from "lucide-react";

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
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || "");
  const [customerAddress, setCustomerAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState("1");

  const { data: categories = [], isLoading } = useQuery<CategoryType[]>({
    queryKey: ["/api/categories"],
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Created",
        description: "Your pickup has been scheduled successfully!",
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

  const addItem = () => {
    if (!currentCategoryId || !currentQuantity) {
      toast({
        title: "Missing Information",
        description: "Please select a category and quantity",
        variant: "destructive",
      });
      return;
    }

    const category = categories.find(c => c.id === currentCategoryId);
    if (!category) return;

    const avgRate = (parseFloat(category.minRate) + parseFloat(category.maxRate)) / 2;
    const quantity = parseInt(currentQuantity);
    const value = avgRate * quantity;

    setSelectedItems([...selectedItems, {
      categoryId: category.id,
      categoryName: category.name,
      quantity,
      rate: avgRate,
      value
    }]);

    setCurrentCategoryId("");
    setCurrentQuantity("1");
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0);

  const handleSubmit = () => {
    if (!customerName || !customerPhone || !customerAddress || !pinCode || !district || !state) {
      toast({
        title: "Missing Information",
        description: "Please fill in all customer details",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please add at least one item",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      customerName,
      customerPhone,
      customerAddress,
      pinCode,
      district,
      state,
      totalValue,
      items: selectedItems,
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
            <Button variant="ghost" onClick={() => setLocation("/dashboard")} data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold font-[Poppins] mb-2">Create New Booking</h1>
        <p className="text-muted-foreground mb-8">Fill in your details and select scrap items</p>

        <div className="space-y-8">
          {/* Step 1: Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    data-testid="input-customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    data-testid="input-customer-phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  data-testid="input-customer-address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pin Code *</Label>
                  <Input
                    id="pincode"
                    data-testid="input-pin-code"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter pin code"
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    data-testid="input-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Enter district"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    data-testid="input-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Select Items */}
          <Card>
            <CardHeader>
              <CardTitle>Select Scrap Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Category *</Label>
                  <Select value={currentCategoryId} onValueChange={setCurrentCategoryId}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select scrap category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} (₹{category.minRate}-₹{category.maxRate}/{category.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32 space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    data-testid="input-quantity"
                    min="1"
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(e.target.value)}
                    placeholder="Qty"
                  />
                </div>

                <div className="w-48 space-y-2">
                  <Label>Estimated Value</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-semibold text-primary" data-testid="text-estimated-value">
                    {currentCategoryId && currentQuantity ? (
                      `₹${(() => {
                        const cat = categories.find(c => c.id === currentCategoryId);
                        if (!cat) return 0;
                        const avg = (parseFloat(cat.minRate) + parseFloat(cat.maxRate)) / 2;
                        return (avg * parseInt(currentQuantity || "0")).toFixed(2);
                      })()}`
                    ) : (
                      "₹0.00"
                    )}
                  </div>
                </div>

                <Button onClick={addItem} data-testid="button-add-item">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Selected Items List */}
              {selectedItems.length > 0 && (
                <div className="mt-6 space-y-2">
                  <Label>Added Items</Label>
                  <div className="border rounded-md divide-y">
                    {selectedItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3" data-testid={`item-${index}`}>
                        <div className="flex-1">
                          <p className="font-medium">{item.categoryName}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold text-primary">₹{item.value.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            data-testid={`button-remove-item-${index}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {selectedItems.length > 0 && (
                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-md">
                  <p className="text-lg font-semibold">Total Estimated Value</p>
                  <p className="text-2xl font-bold text-primary" data-testid="text-total-value">₹{totalValue.toFixed(2)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setLocation("/dashboard")} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createBookingMutation.isPending}
              data-testid="button-submit-booking"
            >
              {createBookingMutation.isPending ? "Creating..." : "Submit Booking"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
