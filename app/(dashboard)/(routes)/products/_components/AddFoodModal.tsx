"use client";

import ImageIcon from '@/components/svgIcons/Image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, Check, CircleCheck } from 'lucide-react';
import React, { useState } from 'react';
import Image from 'next/image';
import BundleConfiguration from './BundleConfiguration';
import CustomizationOptions from './CustomizationOptions';
import PortionSetup from './PortionSetup';

interface AddFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UploadedImage {
    file: File;
    progress: number;
    isUploading: boolean;
    id: string;
}

interface Variant {
    id: string;
    size: string | number;
    quantity: number;
    color: string;
    price?: string;
}

// Helper to check if a color string is valid (name like 'red' or hex like '#FF0000')
const isValidColor = (color: string): boolean => {
    if (!color.trim()) return false;
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
};

// Resolve a color name or hex to a hex string for the swatch
const resolveColorToHex = (color: string): string => {
    if (!isValidColor(color)) return '';
    try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch {
        return '';
    }
};

export default function AddFoodModal({ isOpen, onClose }: AddFoodModalProps) {
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [productType, setProductType] = useState<'simple' | 'customizable' | 'bundle'>('simple');
    const [variants, setVariants] = useState<Variant[]>([{
        id: Math.random().toString(36).substr(2, 9),
        size: '',
        quantity: 0,
        color: '#000000',
        price: ''
    }]);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('1');
    const [quantity, setQuantity] = useState('');
    const [prodFrom, setProdFrom] = useState('');
    const [prodTo, setProdTo] = useState('');
    const [status, setStatus] = useState('');
    const [timeAvailability, setTimeAvailability] = useState('');
    const [servingType, setServingType] = useState('');
    const [servingTypeCustom, setServingTypeCustom] = useState('');
    const [foodCategory, setFoodCategory] = useState('');
    const [foodCategoryCustom, setFoodCategoryCustom] = useState('');
    const [dietaryLabel, setDietaryLabel] = useState('');
    const [dietaryLabelCustom, setDietaryLabelCustom] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        if (uploadedImages.length + files.length > 5) {
            return;
        }

        const validFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 10 * 1024 * 1024) continue;
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        const newImages: UploadedImage[] = validFiles.map((file) => ({
            file: file,
            progress: 0,
            isUploading: true,
            id: Math.random().toString(36).substr(2, 9),
        }));

        setUploadedImages(prev => [...prev, ...newImages]);

        // Simulate upload progress
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
            }, 300 + (index * 100));
        });
    };

    const handleRemoveImage = (id: string) => {
        setUploadedImages(prev => prev.filter(img => img.id !== id));
    };

    const handleVariantChange = (id: string, field: keyof Variant, value: string | number) => {
        setVariants(prev => prev.map(variant =>
            variant.id === id ? { ...variant, [field]: value } : variant
        ));
    };

    const handleColorInputChange = (variantId: string, rawValue: string) => {
        handleVariantChange(variantId, 'color', rawValue);
    };

    const handleAddVariant = () => {
        setVariants(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            size: '',
            quantity: 0,
            color: '#000000',
            price: ''
        }]);
    };

    const handleRemoveVariant = (id: string) => {
        setVariants(prev => prev.filter(variant => variant.id !== id));
    };

    const handleSubmit = () => {
        // UI-only submit - form validation still works
        if (!productName.trim()) return;
        if (!description.trim()) return;
        if (!price || parseFloat(price) <= 0) return;
        if (!weight || parseFloat(weight) <= 0) return;
        if (productType === 'simple' && (!quantity || parseInt(quantity) <= 0)) return;
        if (productType === 'customizable' && variants.some(v => !v.size || v.quantity <= 0)) return;
        if (productType === 'customizable' && variants.some(v => !isValidColor(v.color))) return;
        if (!prodFrom || !prodTo) return;
        if (uploadedImages.length === 0) return;
        if (uploadedImages.some(img => img.isUploading)) return;

        // In real implementation, this would call an API
        console.log('Form submitted successfully');
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setStatus('');
        setTimeAvailability('');
        setServingType('');
        setServingTypeCustom('');
        setFoodCategory('');
        setFoodCategoryCustom('');
        setDietaryLabel('');
        setDietaryLabelCustom('');
    };

    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[50] flex justify-end my-3 mr-3">
            <div
                className="fixed inset-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
                onClick={handleClose}
            />
            <div
                className="h-full w-[85%] md:w-[65%] bg-background shadow-lg overflow-x-auto transform transition-transform duration-300 ease-in-out rounded-xl"
                style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-full p-4 overflow-y-auto">
                    <div className="flex justify-between py-2 items-center border-b border-[#F8F8F8] dark:border-[#2A2A2A]">
                        <div className="flex flex-col gap-0">
                            <h2 className="text-sm font-semibold">Add Food Item</h2>
                            <p className='text-xs font-light text-[#A0A0A0]'>Fill in the details to create a new food item for your restaurant.</p>
                        </div>
                        <Button variant="ghost" className="p-0 h-auto" onClick={handleClose} disabled={isLoading}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className='flex flex-col md:flex-row w-full gap-3 mt-2'>
                        <div className='w-full md:w-[50%]'>
                            <h2 className="text-sm font-semibold">Basic Information</h2>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-1' htmlFor='product'>
                                    Food Name<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id='product'
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder='e.g. Jollof Rice with Chicken'
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-1' htmlFor='description'>
                                    Description<span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id='description'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder='Describe your food item...'
                                    className="w-full min-h-[100px] shadow-none focus:ring-2 transition-all duration-200 resize-none"
                                    maxLength={500}
                                    disabled={isLoading}
                                />
                                <div className="text-right text-xs">{description.length}/500</div>
                            </div>

                            <h2 className="text-sm font-semibold pt-4">Food Type & Status</h2>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2' htmlFor='product-type'>
                                    Food Type<span className="text-destructive">*</span>
                                </Label>
                                <RadioGroup
                                    id='product-type'
                                    value={productType}
                                    onValueChange={(value) => setProductType(value as 'simple' | 'customizable' | 'bundle')}
                                    disabled={isLoading}
                                >
                                    <div className="flex items-center gap-3 text-sm">
                                        <RadioGroupItem value="simple" id="r1" />
                                        <Label htmlFor="r1">Simple</Label>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <RadioGroupItem value="customizable" id="r2" />
                                        <Label htmlFor="r2">Customizable</Label>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <RadioGroupItem value="bundle" id="r3" />
                                        <Label htmlFor="r3">Bundle</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Product Status<span className="text-destructive">*</span>
                                </Label>
                                <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='available'>Available Today</SelectItem>
                                        <SelectItem value='out-of-stock'>Out of Stock</SelectItem>
                                        <SelectItem value='seasonal'>Seasonal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Time-based Availablity<span className="text-destructive">*</span>
                                </Label>
                                <Select value={timeAvailability} onValueChange={setTimeAvailability} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='breakfast'>Breakfast only</SelectItem>
                                        <SelectItem value='lunch'>Lunch</SelectItem>
                                        <SelectItem value='dinner'>Dinner</SelectItem>
                                        <SelectItem value='all-day'>All Day</SelectItem>
                                        <SelectItem value='custom'>Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Serving Type<span className="text-destructive">*</span>
                                </Label>
                                <Select value={servingType} onValueChange={setServingType} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='plate'>Plate</SelectItem>
                                        <SelectItem value='bowl'>Bowl</SelectItem>
                                        <SelectItem value='wrap'>Wrap</SelectItem>
                                        <SelectItem value='pack'>Pack</SelectItem>
                                        <SelectItem value='box'>Box</SelectItem>
                                        <SelectItem value='tray'>Tray</SelectItem>
                                        <SelectItem value='cup'>Cup</SelectItem>
                                        <SelectItem value='portion'>Portion</SelectItem>
                                        <SelectItem value='liter'>Liter</SelectItem>
                                        <SelectItem value='kg'>Kg</SelectItem>
                                        <SelectItem value='custom'>Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className='flex items-center gap-2 mt-2'>
                                    <Input value={servingTypeCustom} onChange={(e) => setServingTypeCustom(e.target.value)} />
                                    <Button size={'sm'} className='bg-white text-black border hover:bg-black hover:text-white'>
                                        <CircleCheck /> Add
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Food Category<span className="text-destructive">*</span>
                                </Label>
                                <Select value={foodCategory} onValueChange={setFoodCategory} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='rich-dishes'>Rich Dishes</SelectItem>
                                        <SelectItem value='snacks'>Snacks</SelectItem>
                                        <SelectItem value='drinks'>Drinks</SelectItem>
                                        <SelectItem value='desserts'>Desserts</SelectItem>
                                        <SelectItem value='custom'>Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className='flex items-center gap-2 mt-2'>
                                    <Input value={foodCategoryCustom} onChange={(e) => setFoodCategoryCustom(e.target.value)} />
                                    <Button size={'sm'} className='bg-white text-black border hover:bg-black hover:text-white'>
                                        <CircleCheck /> Add
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Dietary Labels<span className="text-destructive">*</span>
                                </Label>
                                <Select value={dietaryLabel} onValueChange={setDietaryLabel} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='spicy'>Spicy</SelectItem>
                                        <SelectItem value='vegetarian'>Vegetarian</SelectItem>
                                        <SelectItem value='gluten-free'>Gluten-Free</SelectItem>
                                        <SelectItem value='contains-nuts'>Contains nuts</SelectItem>
                                        <SelectItem value='halal'>Halal</SelectItem>
                                        <SelectItem value='diary-free'>Diary-free</SelectItem>
                                        <SelectItem value='custom'>Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className='flex items-center gap-2 mt-2'>
                                    <Input value={dietaryLabelCustom} onChange={(e) => setDietaryLabelCustom(e.target.value)} />
                                    <Button size={'sm'} className='bg-white text-black border hover:bg-black hover:text-white'>
                                        <CircleCheck /> Add
                                    </Button>
                                </div>
                            </div>

                            {/* Variants Section */}
                            {productType === 'simple' && <PortionSetup />}
                            {productType === 'bundle' && <BundleConfiguration />}
                            {productType === 'customizable' && <CustomizationOptions />}
                        </div>

                        {/* Right - Image Upload */}
                        <div className='w-full md:w-[50%]'>
                            <h2 className="text-sm font-semibold">Food Image</h2>
                            <p className="text-xs text-muted-foreground">Upload food images (max 5)</p>
                            <div className='border border-dashed border-[#4FCA6A] rounded-lg w-full h-75 mt-4 flex flex-col items-center justify-center gap-3 py-3'>
                                <ImageIcon />
                                <Label
                                    htmlFor="picture"
                                    className={`flex items-center justify-center border rounded-lg p-2 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent'
                                        }`}
                                >
                                    <span className="text-sm text-muted-foreground">Upload Picture</span>
                                </Label>
                                <Input
                                    id="picture"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isLoading}
                                />
                                <p className='text-xs text-[#A0A0A0]'>PNG, JPG, GIF up to 10MB, max 5 images</p>
                            </div>

                            {uploadedImages.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {uploadedImages.map((image) => (
                                            <div key={image.id} className="relative w-10 h-10">
                                                <div className="relative w-full h-full rounded border overflow-hidden">
                                                    <Image
                                                        src={URL.createObjectURL(image.file)}
                                                        alt="Uploaded food"
                                                        fill
                                                        className="object-cover"
                                                        sizes="40px"
                                                    />
                                                </div>
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
                                                    disabled={isLoading}
                                                >
                                                    <X className="w-3 h-3 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {uploadedImages.length >= 5 && (
                                        <p className="text-xs text-destructive mt-2">Maximum 5 images reached</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 border-t mt-4 pt-4'>
                        <Button variant="outline" className="px-4 py-2 text-sm" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            className="px-4 py-2 text-sm"
                            onClick={handleSubmit}
                            disabled={isLoading || uploadedImages.length === 0}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Adding Food Item...
                                </>
                            ) : (
                                'Add Food Item'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}