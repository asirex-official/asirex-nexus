import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Lock, MapPin, Calendar, ArrowLeft, Save, Plus, Trash2, 
  Star, LogOut, Heart, Clock, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import PasskeyManagement from "@/components/settings/PasskeyManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface EventRegistration {
  id: string;
  event_id: string;
  status: string;
  registered_at: string;
  event: {
    name: string;
    event_date: string;
    location: string | null;
  };
}

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  birthdate: string | null;
  created_at: string;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Address form state
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setPhone(profileData.phone || "");
      }

      // Fetch addresses
      const { data: addressData } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (addressData) {
        setAddresses(addressData);
      }

      // Fetch event registrations with event details
      const { data: regData } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event_id,
          status,
          registered_at,
          events:event_id (
            name,
            event_date,
            location
          )
        `)
        .eq("user_id", user.id)
        .order("registered_at", { ascending: false });

      if (regData) {
        // Transform the data to match our interface
        const transformed = regData.map((reg: any) => ({
          id: reg.id,
          event_id: reg.event_id,
          status: reg.status,
          registered_at: reg.registered_at,
          event: reg.events,
        }));
        setRegistrations(transformed);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    setSaving(true);

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from("user_addresses")
          .update(addressForm)
          .eq("id", editingAddress.id);

        if (error) throw error;
      } else {
        // Create new address
        const { error } = await supabase
          .from("user_addresses")
          .insert({
            ...addressForm,
            user_id: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: editingAddress ? "Address updated" : "Address added",
        description: "Your address has been saved successfully.",
      });
      
      setShowAddressDialog(false);
      setEditingAddress(null);
      resetAddressForm();
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_addresses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Address deleted",
        description: "The address has been removed.",
      });
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return;

    try {
      // First, unset all defaults
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Then set the new default
      const { error } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Default address set",
        description: "Your default address has been updated.",
      });
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnregisterEvent = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", registrationId);

      if (error) throw error;

      toast({
        title: "Unregistered",
        description: "You have been unregistered from the event.",
      });
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: "Home",
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
      is_default: false,
    });
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone || "",
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default,
    });
    setShowAddressDialog(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const memberSince = profile?.created_at 
    ? format(new Date(profile.created_at), "MMMM yyyy")
    : "Unknown";

  return (
    <div className="min-h-screen bg-background py-20 lg:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* User Info Header */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold">
                  {profile?.full_name || "User"}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">
                    ASIREX Family since {memberSince}
                  </span>
                </div>
              </div>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="password">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </TabsTrigger>
              <TabsTrigger value="addresses">
                <MapPin className="w-4 h-4 mr-2" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input 
                      value={profile?.birthdate 
                        ? format(new Date(profile.birthdate), "MMMM d, yyyy") 
                        : "Not set"} 
                      disabled 
                    />
                  </div>
                  <Button onClick={handleUpdateProfile} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button onClick={handleChangePassword} disabled={saving || !newPassword}>
                    <Lock className="w-4 h-4 mr-2" />
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Saved Addresses</CardTitle>
                      <CardDescription>
                        Manage your delivery addresses
                      </CardDescription>
                    </div>
                    <Dialog open={showAddressDialog} onOpenChange={(open) => {
                      setShowAddressDialog(open);
                      if (!open) {
                        setEditingAddress(null);
                        resetAddressForm();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Address
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingAddress ? "Edit Address" : "Add New Address"}
                          </DialogTitle>
                          <DialogDescription>
                            Enter your delivery address details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Label</Label>
                              <Select
                                value={addressForm.label}
                                onValueChange={(v) => setAddressForm({ ...addressForm, label: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Home">Home</SelectItem>
                                  <SelectItem value="Office">Office</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Full Name</Label>
                              <Input
                                value={addressForm.full_name}
                                onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                placeholder="Receiver's name"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              placeholder="+91 XXXXX XXXXX"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 1</Label>
                            <Input
                              value={addressForm.address_line1}
                              onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                              placeholder="House/Flat No., Building Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Address Line 2 (Optional)</Label>
                            <Input
                              value={addressForm.address_line2}
                              onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                              placeholder="Street, Colony, Landmark"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>City</Label>
                              <Input
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                placeholder="City"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Pincode</Label>
                              <Input
                                value={addressForm.pincode}
                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                placeholder="XXXXXX"
                                maxLength={6}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>State</Label>
                            <Select
                              value={addressForm.state}
                              onValueChange={(v) => setAddressForm({ ...addressForm, state: v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                              <SelectContent>
                                {indianStates.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowAddressDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveAddress} disabled={saving}>
                            {saving ? "Saving..." : "Save Address"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No saved addresses yet</p>
                      <p className="text-sm">Add an address for faster checkout</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="p-4 rounded-lg border border-border bg-card/50 relative"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={address.is_default ? "default" : "secondary"}>
                                  {address.label}
                                </Badge>
                                {address.is_default && (
                                  <Badge variant="outline" className="text-xs">
                                    <Star className="w-3 h-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="font-medium">{address.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              {address.phone && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Phone: {address.phone}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!address.is_default && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                >
                                  <Star className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditAddress(address)}
                              >
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAddress(address.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Event Registrations</CardTitle>
                  <CardDescription>
                    Events you're registered for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {registrations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No event registrations</p>
                      <p className="text-sm">Browse upcoming events to register</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate("/events")}
                      >
                        Browse Events
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((reg) => (
                        <div
                          key={reg.id}
                          className="p-4 rounded-lg border border-border bg-card/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{reg.event?.name}</h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {reg.event?.event_date 
                                    ? format(new Date(reg.event.event_date), "MMM d, yyyy")
                                    : "TBA"}
                                </div>
                                {reg.event?.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {reg.event.location}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Registered {format(new Date(reg.registered_at), "MMM d, yyyy")}
                                </Badge>
                              </div>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  Unregister
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Unregister from event?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    You will lose your spot and need to register again.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleUnregisterEvent(reg.id)}
                                  >
                                    Unregister
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <PasskeyManagement />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
