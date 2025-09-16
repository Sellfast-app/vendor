import ImageIcon from '@/components/svgIcons/Image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent,  SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import React, {  useState } from 'react'

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UploadedImage {
    file: File;
    progress: number;
    isUploading: boolean;
    id: string;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

    if (!isOpen) return null;

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImages: UploadedImage[] = [];

        // Process each selected file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
                const newImage: UploadedImage = {
                    file,
                    progress: 0,
                    isUploading: true,
                    id: Math.random().toString(36).substr(2, 9)
                };
                newImages.push(newImage);
            } else {
                alert("File size must be less than 10MB");
                return;
            }
        }

        if (newImages.length > 0) {
            setUploadedImages(prev => [...prev, ...newImages]);

            // Simulate upload progress for each image
            newImages.forEach((image, index) => {
                const timer = setInterval(() => {
                    setUploadedImages(prev => prev.map(img => {
                        if (img.id === image.id) {
                            const newProgress = img.progress + 20;
                            if (newProgress >= 100) {
                                clearInterval(timer);
                                return { ...img, progress: 100, isUploading: false };
                            }
                            return { ...img, progress: newProgress };
                        }
                        return img;
                    }));
                }, 300 + (index * 100)); // Stagger the uploads
            });
        }
    };

    const handleRemoveImage = (id: string) => {
        setUploadedImages(prev => prev.filter(img => img.id !== id));
    };
    return (
        <div className="fixed inset-0 z-[50] flex justify-end my-3 mr-3">
            <div
                className="fixed inset-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
                onClick={onClose}
            />
            <div
                className="h-full w-[65%] bg-background shadow-lg overflow-x-auto transform transition-transform duration-300 ease-in-out rounded-xl"
                style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-full p-4 overflow-y-auto">
                    <div className="flex justify-between py-2 items-center border-b border-[#F8F8F8] dark:border-[#2A2A2A]">
                        <div className="flex flex-col gap-0">
                            <h2 className="text-sm font-semibold">Add Product</h2>
                            <p className='text-xs font-light text-[#A0A0A0]'>Fill in the details to create a new product for your store.</p>
                        </div>
                        <Button variant="ghost" className="p-0 h-auto" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className='flex w-full gap-3 mt-2'>
                        <div className='w-[50%]'>
                            <h2 className="text-sm font-semibold"> Basic Information</h2>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-1' htmlFor='product'>
                                    Product Name<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id='product'
                                    className=''
                                    placeholder='e.g. Premium Wireless Headphones' />
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-1' htmlFor='description'>Description<span className="text-destructive">*</span></Label>
                                <Textarea
                                    id='description'
                                    placeholder='Tell us about your product...'
                                    className="w-full min-h-[100px] shadow-none focus:ring-2 transition-all duration-200 resize-none "
                                    maxLength={500} />
                                <div className="text-right text-xs ">
                                    /500
                                </div>
                            </div>
                            <h2 className="text-sm font-semibold pt-4"> Product Type & Status</h2>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2 ' htmlFor='product-type'>Product Type<span className="text-destructive">*</span></Label>
                                <RadioGroup id='product-type'>
                                    <div className="flex items-center gap-3 text-sm">
                                        <RadioGroupItem value="single" id="r1" />
                                        <Label htmlFor="r1">Single Product</Label>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <RadioGroupItem value="variant" id="r2" />
                                        <Label htmlFor="r2">Products with Variants</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2 '>Product Status<span className="text-destructive">*</span></Label>
                                <Select >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select product status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='ready-stock'>Ready Stock </SelectItem>
                                        <SelectItem value='made-to-ready'>Made-to-order</SelectItem>
                                        <SelectItem value='out-of-stock'>Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <h2 className="text-sm font-semibold pt-4">Pricing & Inventory</h2>
                            <div className='flex gap-1'>
                                <div>
                                    <Label className='text-xs font-light mt-4 mb-1' htmlFor='price'>Price<span className="text-destructive">*</span></Label>
                                    <Input
                                        id='price'
                                        className=''
                                        placeholder='e.g. ₦99.99' />
                                </div>
                                <div>
                                    <Label className='text-xs font-light mt-4 mb-1' htmlFor='price'>SKU<span className="text-destructive">*</span></Label>
                                    <Input
                                        id='sku'
                                        className=''
                                        placeholder='SKU-123' />
                                </div>
                                <div>
                                    <Label className='text-xs font-light mt-4 mb-1' htmlFor='price'>Quantity<span className="text-destructive">*</span></Label>
                                    <Input
                                        id='quantity'
                                        type='number'
                                        className=''
                                        placeholder='0' />
                                </div>
                            </div>
                            <div className='flex gap-1 w-full'>
                                <div className='w-[50%]'><Label className='text-xs font-light mt-4 mb-1'>Estimated Production Days  (From)<span className="text-destructive">*</span></Label>
                                    <Input
                                        type='number'
                                        className=''
                                        placeholder='0'
                                    /></div>
                                <div className='w-[50%]'><Label className='text-xs font-light mt-4 mb-1'>Estimated Production Days  (To) <span className="text-destructive">*</span></Label>
                                    <Input
                                        type='number'
                                        className=''
                                        placeholder='0'
                                    /></div>
                            </div>
                        </div>
                        <div className='w-[50%]'>
                            <h2 className="text-sm font-semibold"> Product Image</h2>
                            <div className='border border-dashed border-[#4FCA6A] rounded-lg w-full h-75 mt-4 flex flex-col items-center justify-center gap-3 py-3'>
                                <ImageIcon />
                                <Label
                                    htmlFor="picture"
                                    className="flex items-center justify-center border rounded-lg p-2 cursor-pointer hover:bg-accent"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        {/* <Upload className="w-8 h-8 text-muted-foreground" /> */}
                                        <span className="text-sm text-muted-foreground">
                                            Upload Picture
                                        </span>
                                    </div>
                                </Label>
                                <Input
                                    id="picture"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <p className='text-xs text-[#A0A0A0]'>PNG,JPG,GIF up to 10MB, max 5 images</p>
                            </div>
                            {uploadedImages.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {uploadedImages.map((image) => (
                                            <div key={image.id} className="relative w-10 h-10">
                                                <img
                                                    src={URL.createObjectURL(image.file)}
                                                    alt="Uploaded product"
                                                    className="w-full h-full object-cover rounded border"
                                                />
                                                {image.isUploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                                                        <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                                                    </div>
                                                )}
                                                {image.isUploading && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50">
                                                        <div
                                                            className="h-1 bg-green-500 transition-all duration-300"
                                                            style={{ width: `${image.progress}%` }}
                                                        />
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveImage(image.id)}
                                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {uploadedImages.length >= 5 && (
                                        <p className="text-xs text-destructive mt-2">
                                            Maximum 5 images reached
                                        </p>
                                    )}
                                </div>
                            )} </div>
                    </div>
                    <div className='flex justify-end gap-2 border-t mt-4 pt-4'>
                        <Button variant="outline" className="px-4 py-2 text-sm" onClick={onClose}>Cancel</Button>
                        <Button className="px-4 py-2 text-sm">Add Product</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
