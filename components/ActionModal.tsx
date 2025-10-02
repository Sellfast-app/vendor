"use client";

import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titleText: string;
  icon: ReactNode;
  heading: string;
  description: string;
  productImage: string;
  productName: string;
  productId: string;
  productPrice: string;
  productStock: string;
  cancelText?: string;
  confirmText?: string;
  confirmButtonColor?: string;
  className?: string;
}

export default function ActionModal({
  isOpen,
  onClose,
  onConfirm,
  titleText,
  icon,
  description,
  productImage,
  productName,
  productId,
  productPrice,
  productStock,
  cancelText,
  confirmText,
  confirmButtonColor = "#E40101",
  className = "",
}: ActionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent
        className={`sm:max-w-[500px] border-none rounded-lg p-6 bg-card ${className}`}
      >
        <VisuallyHidden>
          <DialogTitle>{titleText}</DialogTitle>
        </VisuallyHidden>
        <div className="flex-col items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">{titleText}</h2>
          <p className="text-xs font-light">Let&apos;s make sure you want to perform this action</p>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div
            className="flex items-center justify-center w-18 h-18"
          >
            {icon}
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <div className="flex items-center justify-between w-full mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative w-10 h-10 rounded overflow-hidden mr-4">
              <Image
                src={productImage}
                alt={productName}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">{productName}</h4>
              <p className="text-xs text-gray-500">ID: {productId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">₦{productPrice}</p>
              <p className="text-xs text-gray-500">Stock: {productStock}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            className="text-white"
            style={{ backgroundColor: confirmButtonColor }}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}