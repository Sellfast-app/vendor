"use client";

import React, { useState } from 'react'
import { toast } from 'sonner';


interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
  
  }
  

export default function NotificationModal({onClose, isOpen}: NotificationModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        if (isLoading) {
            toast.warning('Please wait while we finish adding your product');
            return;
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[50] flex justify-end my-3 mr-3">
            <div
                className="fixed inset-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
                onClick={handleClose} />
            <div
                className="h-full w-[65%] bg-background shadow-lg overflow-x-auto transform transition-transform duration-300 ease-in-out rounded-xl"
                style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
                onClick={(e) => e.stopPropagation()} >
                NotificationModal
            </div>
        </div>
    )
}

