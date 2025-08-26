"use client";

import { MobileSidebar } from "./Mobile-sidebar";
import { NavbarRoutes } from "./navbar-routes";

export const Navbar = () => {

  return (
    <div className="p-4 border-b border-[#F5F5F5] h-full flex items-center  bg-card">
      <MobileSidebar />
      <NavbarRoutes />
    </div>
  );
};
