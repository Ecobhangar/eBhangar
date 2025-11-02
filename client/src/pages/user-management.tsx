import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Shield, User as UserIcon, Store } from "lucide-react";

interface User {
  id: string;
  phoneNumber: string;
  name: string | null;
  role: "customer" | "admin" | "vendor";
  address: string | null;
  pinCode: string | null;
  district: string | null;
  state: string | null;
  createdAt: string;
}

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  const { data: currentUserProfile } = useQuery<User>({
    queryKey: ["/api/users/me"],
    enabled: !!user,
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "vendor":
        return <Store className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "vendor":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and permissions
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {users?.map((user) => (
          <Card key={user.id} data-testid={`card-user-${user.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">
                      {user.name || "Unnamed User"}
                    </CardTitle>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Phone:</span>
                      <span data-testid={`text-phone-${user.id}`}>{user.phoneNumber}</span>
                    </div>
                    {user.address && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Address:</span>
                        <span className="text-sm">{user.address}</span>
                      </div>
                    )}
                    {user.pinCode && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Pin Code:</span>
                        <span>{user.pinCode}</span>
                      </div>
                    )}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={selectedRoles[user.id] || user.role}
                    onValueChange={(value) => {
                      setSelectedRoles({ ...selectedRoles, [user.id]: value });
                      handleRoleChange(user.id, value);
                    }}
                    disabled={user.id === currentUserProfile?.id || updateRoleMutation.isPending}
                  >
                    <SelectTrigger className="w-[150px]" data-testid={`select-role-${user.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer" data-testid={`option-customer-${user.id}`}>
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          Customer
                        </div>
                      </SelectItem>
                      <SelectItem value="vendor" data-testid={`option-vendor-${user.id}`}>
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          Vendor
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" data-testid={`option-admin-${user.id}`}>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {user.id === currentUserProfile?.id && (
                    <Badge variant="outline" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {users && users.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Users Found</p>
            <p className="text-sm text-muted-foreground">
              There are no users in the system yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
