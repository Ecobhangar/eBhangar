import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, UserPlus } from "lucide-react";

const vendorOnboardingSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  location: z.string().min(1, "Area/Locality is required"),
  pinCode: z.string()
    .length(6, "Pin code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Pin code must contain only digits"),
  active: z.boolean().default(true),
});

type VendorOnboardingForm = z.infer<typeof vendorOnboardingSchema>;

export default function VendorOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<VendorOnboardingForm>({
    resolver: zodResolver(vendorOnboardingSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      location: "",
      pinCode: "",
      active: true,
    },
  });

  const onboardVendor = useMutation({
    mutationFn: async (data: VendorOnboardingForm) => {
      const res = await apiRequest("POST", "/api/admin/vendors/onboard", data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "Vendor added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      form.reset();
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vendor",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VendorOnboardingForm) => {
    onboardVendor.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-green-50/50 dark:from-gray-950 dark:via-green-950/20 dark:to-gray-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-[Poppins] bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Vendor Onboarding
              </h1>
              <p className="text-muted-foreground">Add a new vendor to the system</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-green-100 dark:border-green-900/30 shadow-xl">
          <CardHeader>
            <CardTitle className="font-[Poppins]">Vendor Details</CardTitle>
            <CardDescription>Enter the vendor's information below</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Vendor Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter vendor name"
                          {...field}
                          data-testid="input-vendor-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter 10-digit phone number"
                          {...field}
                          data-testid="input-phone-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Area / Locality */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area / Locality</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter area or locality"
                          {...field}
                          data-testid="input-location"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pincode */}
                <FormField
                  control={form.control}
                  name="pinCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter 6-digit pincode"
                          maxLength={6}
                          {...field}
                          data-testid="input-pincode"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Toggle */}
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-green-100 dark:border-green-900/30 p-4 bg-green-50/50 dark:bg-green-950/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Vendor Status</FormLabel>
                        <FormDescription>
                          Set the vendor as active or inactive
                        </FormDescription>
                      </div>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${field.value ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                            {field.value ? 'Active' : 'Inactive'}
                          </span>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-vendor-status"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Success Message */}
                {isSuccess && (
                  <div className="p-4 rounded-lg bg-green-100 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 text-center font-medium">
                      ✓ Vendor added successfully! Redirecting...
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={onboardVendor.isPending || isSuccess}
                  data-testid="button-submit-vendor"
                >
                  {onboardVendor.isPending ? (
                    <>
                      <span className="animate-pulse">Adding Vendor...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Add Vendor
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
