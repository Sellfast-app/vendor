
import { IoNotificationsOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { HiOutlineExternalLink } from "react-icons/hi";
import { Search } from "lucide-react";

export const NavbarRoutes = () => {

  return (
    <div className="flex items-center justify-between gap-6 w-full p-4">
      <div className="hidden md:block max-w-md pl-4 relative w-full">
      <Search className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search ..."
            className=" p-2 border border-[#F5F5F5] w-full rounded-lg dark:bg-background dark:border-0"
          />
      </div>
      <div className="flex items-center gap-3">
        <IoNotificationsOutline />
        <Button variant={"outline"} className="rounded-full dark:bg-background">Visit Your StoreFront <HiOutlineExternalLink /></Button>
      </div>
    </div>
  );
};