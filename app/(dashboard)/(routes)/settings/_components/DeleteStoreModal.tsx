"use client";

import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";

interface Store {
  id: string;
  name: string;
  type: string;
  whatsappNumber: string;
  bio: string;
  image: string | null;
}

interface DeleteStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  store: Store | null;
}

export default function DeleteStoreModal({
  isOpen,
  onClose,
  onConfirm,
  store,
}: DeleteStoreModalProps) {
  if (!store) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[500px] border-none rounded-lg p-6 bg-card">
        <VisuallyHidden>
          <DialogTitle>Delete Store</DialogTitle>
        </VisuallyHidden>
        
        <div className="flex-col items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Confirm Action</h2>
          <p className="text-xs font-light text-muted-foreground">
            Let&apos;s make sure you want to perform this action
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Delete Icon */}
          <div className="flex items-center justify-center w-24 h-24 bg-red-500 rounded-full">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h3 className="text-base font-semibold mb-1">Delete and Clear Data</h3>
            <p className="text-xs text-muted-foreground px-4">
              Are you sure you want to delete this order, all information pertaining to this store such as orders, products etc. will be lost, this action is irreversible?
            </p>
          </div>

          {/* Store Details */}
          <div className="flex items-center justify-between w-full mt-4 p-4 bg-gray-50 dark:bg-background rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-12 h-12 rounded-md">
                <AvatarImage src={store.image || ""} alt={store.name} />
                <AvatarFallback>{store.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{store.name}</h4>
                <p className="text-xs text-muted-foreground">{store.type}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs text-green-600 hover:text-green-700"
            >
              View Store <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete Store
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}