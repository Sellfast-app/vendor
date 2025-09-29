"use client"

import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import React, { useState } from 'react'
import SettingsTabs from './_components/SettingsTabs'
import { Button } from '@/components/ui/button'
import Logout from '@/components/svgIcons/Logout'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Helper function to get cookie value
  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Retrieve accessToken from cookies
      const accessToken = getCookieValue("accessToken");

      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to clear session");
      }

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies manually (since logout API should handle this, but as backup)
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "store_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Redirect to login
      router.push("/login");
      toast.success("Logged out successfully");
      window.location.reload(); // Critical for state cleanup
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed - please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold">Account Information</h3>
        <div className='relative'>
          <Input type="text" placeholder="Search Settings..." className="mb-2"/>
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <SettingsTabs/>
      
      <div className="lg:hidden mt-6">
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <Logout className="mr-2" />
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  )
}