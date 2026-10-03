'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { CountrySelect } from '@/components/ui/country-select';
import { AddressForm } from '@/components/ui/address-form';

interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Profile edit
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // New address form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: user?.country || 'United States',
    isDefault: false,
  });
  const [isAddingAddr, setIsAddingAddr] = useState(false);

  const fetchAddresses = () => {
    setLoadingAddresses(true);
    api
      .get<UserAddress[]>('/users/addresses')
      .then((data) => setAddresses(data))
      .catch(console.error)
      .finally(() => setLoadingAddresses(false));
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCountry(user.country || 'United States');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg(null);

    try {
      await api.patch('/auth/profile', { name, phone, country });
      await refreshUser();
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingAddr(true);

    try {
      await api.post('/users/addresses', newAddr);
      setShowAddAddress(false);
      setNewAddr({
        fullName: user?.name || '',
        phone: user?.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: user?.country || 'United States',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    } finally {
      setIsAddingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Trader Profile & Addresses</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your contact credentials and verified destination addresses for physical rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Personal Profile Card */}
        <Card className="p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Account Information</h3>
          </div>

          {profileMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Phone Number</label>
              <input
                type="text"
                placeholder="+1 555 0192"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <CountrySelect
                label="Country of Residence"
                value={country}
                onChange={setCountry}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" size="sm" isLoading={isUpdatingProfile}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Saved Shipping Addresses Card (Section 16) */}
        <Card className="p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Saved Delivery Addresses</h3>
            </div>
            <button
              onClick={() => setShowAddAddress(!showAddAddress)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{showAddAddress ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* Add New Form */}
          {showAddAddress && (
            <form onSubmit={handleAddAddress} className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
              <AddressForm
                value={newAddr}
                onChange={(addr) => setNewAddr((prev) => ({ ...prev, ...addr }))}
                showPresets={true}
              />

              <div className="flex justify-end pt-1 border-t border-slate-200 dark:border-slate-800">
                <Button type="submit" size="sm" isLoading={isAddingAddr}>
                  Save Address
                </Button>
              </div>
            </form>
          )}

          {/* List of saved addresses */}
          {loadingAddresses ? (
            <div className="py-6 text-center text-xs text-slate-500">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No saved addresses. You can add one now or during reward checkout.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs space-y-1 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{addr.fullName}</span>
                    <div className="flex items-center gap-2">
                      {addr.isDefault && <Badge variant="success">DEFAULT</Badge>}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Delete address"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">{addr.addressLine1}</div>
                  <div className="text-slate-500">
                    {addr.city}, {addr.state} {addr.postalCode} • {addr.country}
                  </div>
                  <div className="text-slate-500 font-mono text-[11px] pt-0.5">
                    Phone: {addr.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
