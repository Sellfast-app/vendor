import { SidebarRoutes } from "@/components/sidebar-routes"
import Logo from "@/components/svgIcons/Logo";

export const Sidebar = () => {
    return (
        <div className="h-full md:w-[250px] border-r border-[#F5F5F5] dark:border-background
        flex flex-col items-center overflow-y-auto bg-card ">
           <div className="p-4 h-[80px] border-b border-[#F5F5F5] dark:border-background w-full">
         <Logo />
           </div>
           <div className="flex flex-col w-full mt-3">
            <SidebarRoutes />
           </div>
        </div>
    )
}