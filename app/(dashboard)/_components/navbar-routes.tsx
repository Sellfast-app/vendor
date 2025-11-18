import { IoNotificationsOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { HiOutlineExternalLink } from "react-icons/hi";
import { Search, Settings } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationModal from "./NotificationModal";

export const NavbarRoutes = () => {
  const [businessName, setBusinessName] = useState<string>("My Business");
  const [storefrontUrl, setStorefrontUrl] = useState<string>("");
  const router = useRouter();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const getCookieValue = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  useEffect(() => {
    const storeName = getCookieValue("store_name");
    if (storeName) {
      setBusinessName(decodeURIComponent(storeName)); 
    } else {
      setBusinessName("My Business"); 
    }

    // Get storefront URL from cookie
    const urlFromCookie = getCookieValue("store_url");
    if (urlFromCookie) {
      try {
        const decodedUrl = decodeURIComponent(urlFromCookie);
        setStorefrontUrl(decodedUrl);
      } catch {
        setStorefrontUrl(urlFromCookie);
      }
    }
  }, []);

  useEffect(() => {
    const checkForUpdatedStoreName = () => {
      const storeName = getCookieValue("store_name");
      if (storeName) {
        const decodedStoreName = decodeURIComponent(storeName);
        if (decodedStoreName !== businessName) {
          setBusinessName(decodedStoreName);
        }
      }
    };

    checkForUpdatedStoreName();
    const interval = setInterval(checkForUpdatedStoreName, 1000);

    return () => clearInterval(interval);
  }, [businessName]);

  const getInitials = (name: string) => {
    const words = name.split(" ").filter(Boolean);
    if (words.length === 0) return "MB";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleVisitStorefront = () => {
    if (storefrontUrl) {
      // Ensure the URL has the proper protocol and is not encoded
      let fullUrl = storefrontUrl;
      if (!storefrontUrl.startsWith('http')) {
        fullUrl = `https://${storefrontUrl}`;
      }
      // Clean the URL - remove any encoding
      fullUrl = fullUrl.replace(/%3A/g, ':').replace(/%2F/g, '/');
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback if no URL is available
      console.log('No storefront URL available');
    }
  };

  return (
    <div className="flex items-center justify-between gap-6 w-full p-4">
      <div className="hidden md:block max-w-md pl-4 relative w-full">
        <Search className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search ..."
          className=" p-2 border border-[#F5F5F5] w-full rounded-lg dark:bg-background dark:border-0"
        />
      </div>

      <div className="md:hidden flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full max-w-[200px]"> 
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8 border rounded-full text-center">
                <AvatarImage alt={businessName} />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center w-full h-full text-xs font-medium">
                  {getInitials(businessName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {businessName}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              Other Stores
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3">
        <Button variant={"ghost"} onClick={() => setIsNotificationModalOpen(true)}> 
          <IoNotificationsOutline className="w-5 h-5" />
        </Button>
       
        <Button variant="ghost" onClick={() => router.push("/settings")}>
          <Settings className="md:hidden w-4 h-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors"/>
        </Button>
        
        <Button 
          variant={"outline"} 
          className="rounded-full dark:bg-background hidden md:flex"
          onClick={handleVisitStorefront}
        >
          Visit Your StoreFront <HiOutlineExternalLink />
        </Button>
      </div>
      
      <NotificationModal
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />
    </div>
  );
};