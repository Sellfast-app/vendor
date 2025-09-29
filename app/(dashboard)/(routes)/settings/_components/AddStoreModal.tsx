"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import SaveIcon from "@/components/svgIcons/SaveIcon";

interface Store {
  id: string;
  name: string;
  type: string;
  whatsappNumber: string;
  bio: string;
  image: string | null;
}

const businessTypes = [
  "Restaurant/Food Service",
  "Retail Store",
  "E-commerce",
  "Professional Services",
  "Health & Beauty",
  "Technology",
  "Education",
  "Real Estate",
  "Other",
];

export default function AddStoreModal({ isOpen, onClose, setStores }: {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    countryCode: "+234",
    type: "",
    bio: "",
    image: null as File | null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    const newStore = {
      id: `STORE-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      whatsappNumber: `${formData.countryCode} ${formData.whatsappNumber}`,
      bio: formData.bio,
      image: previewImage || "/placeholder-store.jpg",
    };
    setStores((prev) => [...prev, newStore]);
    setFormData({ name: "", whatsappNumber: "", countryCode: "+234", type: "", bio: "", image: null });
    setPreviewImage(null);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[571px] rounded-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-sm font-semibold">Edit Store</DialogTitle>
          <p className="text-xs font-light text-gray-400 dark:text-gray-100">
            Let&apos;s make sure you want to perform this action
          </p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={previewImage || "/placeholder-store.jpg"} alt="Store Logo" />
                <AvatarFallback>{formData.name[0] || "S"}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-3 right-3">
                <Camera className="w-6 h-6 text-gray-500 cursor-pointer absolute -top-2 -right-2 bg-white rounded-full p-1" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-center text-gray-400 dark:text-gray-100">Upload your store logo or image</p>
          </div>

          <div className="flex justify-between items-center gap-4">
            <div className="space-y-2 md:col-span-2 w-full md:w-[50%]">
              <Label htmlFor="storeName" className="text-xs">Store Name *</Label>
              <Input
                id="storeName"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="dark:bg-background "
              />
            </div>
            <div className="space-y-2 md:col-span-2 w-full md:w-[50%]">
              <Label htmlFor="whatsappNumber" className="text-xs">WhatsApp Business Number *</Label>
              <div className="flex gap-1">
                <Select
                  value={formData.countryCode}
                  onValueChange={(value) => handleInputChange("countryCode", value)}
                >
                  <SelectTrigger className="max-w-[85px] dark:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+234">+234</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                  className="flex-1 dark:bg-background"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeType" className="text-xs">Store Type *</Label>
            <Select onValueChange={(value) => handleInputChange("type", value)} value={formData.type}>
              <SelectTrigger className="w-full dark:bg-background">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="bio" className="text-xs">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              maxLength={500}
              className="dark:bg-background resize-none text-xs"
              placeholder="Write a bio for your store..."
            />
            <p className="text-xs text-right text-muted-foreground absolute right-1 bottom-1">
              {formData.bio.length}/500
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button variant="default" onClick={handleSave} size="sm">
              <SaveIcon />
              <span className="ml-2 hidden sm:inline">Save Changes</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}