import { MobileSidebar } from "./_components/Mobile-sidebar";
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { StoreBusinessProvider } from "@/components/store-business-context";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreBusinessProvider>
    <div className="min-h-dvh w-full min-w-0 overflow-x-clip">
      <div className="h-[80px] md:pl-62.5 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-45">
        <Sidebar />
      </div>
      <main className="min-h-dvh w-full min-w-0 overflow-x-clip md:pl-63 pt-[80px] pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-0 bg-[#FCFCFC] dark:bg-background">
        {children}
      </main>
      <MobileSidebar />
    </div>
    </StoreBusinessProvider>
  );
};

export default DashboardLayout;
