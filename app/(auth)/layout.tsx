"use client";

import Frame from "@/public/Frame.png";
import Fra from "@/public/Fra.png";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side: Image (Hidden on screens smaller than lg) */}
      <div className="flex w-full items-start justify-center overflow-y-auto px-4 py-6 sm:px-6 md:px-8 lg:w-1/2 lg:items-center lg:py-8">
        {children}
      </div>

  {/* Right Side: Auth Form Area */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <Image
          src={Frame}
          alt="Light mode background"
          fill
          className="p-8"
        />
        <div className="w-[85%] h-[85%] absolute right-0 bottom-13">
        <Image
          src={Fra}
          alt="Light mode background"
          fill
          className="p-9"
        />
        </div>      
      </div>
     
    </div>
  );
}
