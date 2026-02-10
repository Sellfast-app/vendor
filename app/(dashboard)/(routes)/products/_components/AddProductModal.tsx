"use client";

import ImageIcon from '@/components/svgIcons/Image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, Check } from 'lucide-react';
import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import { ColorPickerPopup } from '@/components/ColorPicker';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
    onAddProduct: (product: any) => void;
}

interface UploadedImage {
    file: File;
    progress: number;
    isUploading: boolean;
    id: string;
    compressedFile?: File; // Store compressed file
}

interface Variant {
    id: string;
    size: string | number;
    quantity: number;
    color: string; 
}

interface ApiVariant {
    size: string;
    quantity: number;
    color: string; 
}

// Cookie utility function
const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

// Image compression configuration - silent background compression
const compressionOptions = {
    maxSizeMB: 0.8, // Reduced to 800KB for faster uploads
    maxWidthOrHeight: 1600, // Good resolution for web
    useWebWorker: true, // Use web worker for better performance
    initialQuality: 0.65, // Balanced quality vs size
    fileType: 'image/webp', // Use WebP for better compression (browser support is good)
    alwaysKeepResolution: false, // Allow resolution reduction for very large images
    onProgress: undefined // No progress callback - keep it silent
};

// Silent compression function - no toast messages
const compressImageSilently = async (file: File): Promise<File> => {
    try {
        // Skip compression for already small files
        if (file.size < 300 * 1024) { // Less than 300KB
            return file;
        }

        // Skip compression for WebP files (already compressed)
        if (file.type === 'image/webp') {
            return file;
        }

        const compressedFile = await imageCompression(file, compressionOptions);
        return compressedFile;
    } catch (error) {
        console.error('Silent compression failed, using original:', error);
        return file; // Fallback to original file silently
    }
};

// Process multiple images silently
const compressImagesSilently = async (files: File[]): Promise<File[]> => {
    const compressedFiles: File[] = [];
    
    for (const file of files) {
        const compressedFile = await compressImageSilently(file);
        compressedFiles.push(compressedFile);
    }
    
    return compressedFiles;
};

const PRESET_COLORS = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Purple', value: '#A855F7' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Brown', value: '#92400E' },
    { name: 'Navy', value: '#1E3A8A' },
];

export default function AddProductModal({ isOpen, onClose, onAddProduct }: AddProductModalProps) {
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [productType, setProductType] = useState<'single' | 'variant'>('single');
    const [variants, setVariants] = useState<Variant[]>([{ 
        id: Math.random().toString(36).substr(2, 9), 
        size: '', 
        quantity: 0,
        color: '#000000' 
    }]);
     const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [weight, setWeight] = useState('1'); // Default weight to 1kg
    const [quantity, setQuantity] = useState('');
    const [prodFrom, setProdFrom] = useState('');
    const [prodTo, setProdTo] = useState('');
    const [status, setStatus] = useState('ready');
    const [isLoading, setIsLoading] = useState(false);
    const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        // Check total number of images won't exceed 5
        if (uploadedImages.length + files.length > 5) {
            toast.error(`You can only upload ${5 - uploadedImages.length} more image(s)`);
            return;
        }

        // Prepare files for processing
        const validFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Basic validation
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image file`);
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 10MB limit`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        // Show success toast immediately
        toast.success(`Added ${validFiles.length} image(s)`);

        // Process images silently in the background
        const compressedFiles = await compressImagesSilently(validFiles);

        // Create new image objects with compressed files
        const newImages: UploadedImage[] = compressedFiles.map((file, index) => ({
            file: file,
            progress: 0,
            isUploading: true,
            id: Math.random().toString(36).substr(2, 9),
            compressedFile: file,
        }));

        // Add to state
        setUploadedImages(prev => [...prev, ...newImages]);

        // Simulate upload progress (user sees this as normal upload)
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
        toast.info("Image removed");
    };

    const handleVariantChange = (id: string, field: keyof Variant, value: string | number) => {
        setVariants(prev => prev.map(variant =>
            variant.id === id ? { ...variant, [field]: value } : variant
        ));
    };

    const handleAddVariant = () => {
        setVariants(prev => [...prev, { 
            id: Math.random().toString(36).substr(2, 9), 
            size: '', 
            quantity: 0,
            color: '#000000' // Add default color
        }]);
        toast.info("New variant added");
    };

    const handleRemoveVariant = (id: string) => {
        setVariants(prev => prev.filter(variant => variant.id !== id));
        toast.info("Variant removed");
    };

    const mapStatusToApi = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'Ready Stock': 'ready',
            'Made-to-order': 'made-to-order',
            'Out of Stock': 'out-of-stock'
        };
        return statusMap[status] || 'ready';
    };

    const mapStatusFromApi = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'ready': 'Ready Stock',
            'made-to-order': 'Made-to-order',
            'out-of-stock': 'Out of Stock'
        };
        return statusMap[status] || 'Ready Stock';
    };

    const handleSubmit = async () => {
        // Validation with detailed toast messages
        if (!productName.trim()) {
            toast.error('Product name is required');
            return;
        }
        if (!description.trim()) {
            toast.error('Description is required');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            toast.error('Valid price is required');
            return;
        }
        if (!weight || parseFloat(weight) <= 0) {
            toast.error('Valid weight is required');
            return;
        }
        if (productType === 'single' && (!quantity || parseInt(quantity) <= 0)) {
            toast.error('Quantity is required for single products');
            return;
        }
        if (productType === 'variant' && variants.some(v => !v.size || v.quantity <= 0)) {
            toast.error('All variants must have size and quantity');
            return;
        }
        if (!prodFrom || !prodTo) {
            toast.error('Production days are required');
            return;
        }

        // Validate at least one image is uploaded
        if (uploadedImages.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        // Check if any images are still uploading
        if (uploadedImages.some(img => img.isUploading)) {
            toast.error('Please wait for images to finish uploading');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Adding product...');

        try {
            // Get store_id from cookies
            const storeId = getCookie('store_id');
            
            if (!storeId) {
                throw new Error('Store ID not found. Please login again.');
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('name', productName);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('type', productType);
            formData.append('status', mapStatusToApi(status));
            formData.append('weight', weight);
            
            // Calculate total quantity
            const totalQuantity = productType === 'single' 
                ? parseInt(quantity).toString() 
                : variants.reduce((sum, v) => sum + v.quantity, 0).toString();
            
            formData.append('quantity', totalQuantity);
            formData.append('est_prod_days_from', prodFrom);
            formData.append('est_prod_days_to', prodTo);
            formData.append('store_id', storeId);

            // Handle variants
            let variantsData: ApiVariant[] = [];
            if (productType === 'variant') {
                variantsData = variants.map(variant => ({
                    size: variant.size.toString(),
                    quantity: variant.quantity,
                    color: variant.color 
                }));
            }
            
            formData.append('variants', JSON.stringify(variantsData));

            // Add images (already compressed silently during upload)
            uploadedImages.forEach((image, index) => {
                // Use compressed file if available, otherwise use original
                const fileToSend = image.compressedFile || image.file;
                formData.append('files', fileToSend, `product-image-${index}.webp`);
            });

            // API call
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            // Get response text first
            const responseText = await response.text();
            console.log('=== RAW RESPONSE ===', responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                throw new Error('Server returned invalid response');
            }

            console.log('=== PARSED RESULT ===', result);

            if (!response.ok) {
                console.error('API Error Response:', result);
                throw new Error(result.message || `Failed to add product: ${response.status}`);
            }

            // CRITICAL FIX: Check for result.data NOT result.product
            if (!result || result.status !== 'success') {
                console.error('Unexpected response format:', result);
                throw new Error(result?.message || 'Unexpected response from server');
            }

            // CRITICAL FIX: API returns data in result.data
            if (!result.data || typeof result.data !== 'object') {
                console.error('Missing product data in response:', result);
                throw new Error('Product created but server returned incomplete data');
            }

            // Transform using result.data (NOT result.product)
            const productData = result.data;
            
            const newProduct = {
                sku: productData.product_sku || `SKU-${Date.now()}`,
                productName: productData.product_name || productName,
                description: productData.product_description || description,
                stock: productData.product_quantity || parseInt(quantity) || 0,
                remanent: productData.product_quantity || parseInt(quantity) || 0,
                sales: productData.product_price ? parseFloat(productData.product_price) : parseFloat(price),
                status: productData.product_status ? mapStatusFromApi(productData.product_status) : mapStatusFromApi(status),
                createdAt: productData.created_at || new Date().toISOString(),
                thumbnail: productData.product_images?.[0] || '/thumbnails/default.png',
                variants: (() => {
                    try {
                        const variantsData = productData.variants;
                        if (!variantsData) return [];
                        return typeof variantsData === 'string' 
                            ? JSON.parse(variantsData || '[]')
                            : variantsData || [];
                    } catch (e) {
                        console.error('Error parsing variants:', e);
                        return [];
                    }
                })(),
                weight: productData.product_weight || weight,
            };

            console.log('✅ Successfully created product:', newProduct);

            onAddProduct(newProduct);
            toast.dismiss(loadingToast);
            toast.success('Product added successfully! 🎉');
            
            resetForm();
            onClose();

        } catch (error) {
            console.error('Error adding product:', error);
            toast.dismiss(loadingToast);
            toast.error(error instanceof Error ? error.message : 'Failed to add product');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setUploadedImages([]);
        setProductType('single');
        setVariants([{ 
            id: Math.random().toString(36).substr(2, 9), 
            size: '', 
            quantity: 0,
            color: '#000000'
        }]);
         setProductName('');
        setDescription('');
        setPrice('');
        setWeight('1'); // Reset to default weight
        setQuantity('');
        setProdFrom('');
        setProdTo('');
        setStatus('ready');
    };

    const handleClose = () => {
        if (isLoading) {
            toast.warning('Please wait while we finish adding your product');
            return;
        }
        
        // Check if form has data and confirm close
        const hasData = productName || description || price || uploadedImages.length > 0;
        if (hasData) {
            toast('You have unsaved changes. Are you sure you want to close?', {
                action: {
                    label: 'Yes, close',
                    onClick: () => {
                        toast.info('Form closed without saving');
                        onClose();
                    }
                },
                cancel: {
                    label: 'Cancel',
                    onClick: () => toast.info('Stay on form')
                }
            });
        } else {
            onClose();
        }
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
                            <h2 className="text-sm font-semibold">Add Product</h2>
                            <p className='text-xs font-light text-[#A0A0A0]'>Fill in the details to create a new product for your store.</p>
                        </div>
                        <Button variant="ghost" className="p-0 h-auto" onClick={handleClose} disabled={isLoading}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className='flex flex-col md:flex-row w-full gap-3 mt-2'>
                        <div className='w-full md:w-[50%]'>
                            <h2 className="text-sm font-semibold"> Basic Information</h2>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-1' htmlFor='product'>
                                    Product Name<span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id='product'
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className=''
                                    placeholder='e.g. Premium Wireless Headphones'
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-1' htmlFor='description'>Description<span className="text-destructive">*</span></Label>
                                <Textarea
                                    id='description'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder='Tell us about your product...'
                                    className="w-full min-h-[100px] shadow-none focus:ring-2 transition-all duration-200 resize-none"
                                    maxLength={500}
                                    disabled={isLoading}
                                />
                                <div className="text-right text-xs">
                                    {description.length}/500
                                </div>
                            </div>
                            <h2 className="text-sm font-semibold pt-4"> Product Type & Status</h2>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2' htmlFor='product-type'>Product Type<span className="text-destructive">*</span></Label>
                                <RadioGroup 
                                    id='product-type' 
                                    value={productType} 
                                    onValueChange={(value) => {
                                        setProductType(value as 'single' | 'variant');
                                        toast.info(`Product type set to: ${value}`);
                                    }}
                                    disabled={isLoading}
                                >
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
                                <Label className='text-xs font-light mt-4 mb-2'>Product Status<span className="text-destructive">*</span></Label>
                                <Select value={status} onValueChange={(value) => {
                                    setStatus(value);
                                    toast.info(`Status set to: ${value}`);
                                }} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select product status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='ready'>Ready Stock</SelectItem>
                                        <SelectItem value='made-to-order'>Made-to-order</SelectItem>
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
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className=''
                                        placeholder='e.g. 40000.00'
                                        type='number'
                                        step='0.01'
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <Label className='text-xs font-light mt-4 mb-1' htmlFor='weight'>Weight (kg)<span className="text-destructive">*</span></Label>
                                    <Input
                                        id='weight'
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className=''
                                        placeholder='1'
                                        type='number'
                                        step='0.1'
                                        min='0.1'
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <Label className='text-xs font-light mt-4 mb-1' htmlFor='quantity'>Quantity<span className="text-destructive">*</span></Label>
                                    <Input
                                        id='quantity'
                                        type='number'
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className=''
                                        placeholder='0'
                                        disabled={productType === 'variant' || isLoading}
                                    />
                                </div>
                            </div>
                            <div className='flex gap-1 w-full'>
                                <div className='w-[50%]'>
                                    <Label className='text-xs font-light mt-4 mb-1'>Estimated Production Days (From)<span className="text-destructive">*</span></Label>
                                    <Input
                                        type='number'
                                        value={prodFrom}
                                        onChange={(e) => setProdFrom(e.target.value)}
                                        className=''
                                        placeholder='2'
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className='w-[50%]'>
                                    <Label className='text-xs font-light mt-4 mb-1'>Estimated Production Days (To)<span className="text-destructive">*</span></Label>
                                    <Input
                                        type='number'
                                        value={prodTo}
                                        onChange={(e) => setProdTo(e.target.value)}
                                        className=''
                                        placeholder='5'
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Variants Section */}
                           
{productType === 'variant' && (
    <div className="mt-4">
        <h3 className="text-sm font-semibold">Variants</h3>
        <p className="text-xs text-muted-foreground mb-3">Add different sizes, colors and quantities for your product</p>
        {variants.map((variant) => (
            <div key={variant.id} className="mt-4 border border-dashed border-[#4FCA6A] rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                    {/* Size Variant */}
                    <div>
                        <Label className="text-xs font-light">Size<span className="text-destructive">*</span></Label>
                        <div className="mt-1 flex gap-2">
                            <Input
                                type="text"
                                value={variant.size.toString()}
                                onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)}
                                placeholder="e.g. S, M, L, XL"
                                className="w-full"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    {/* Quantity */}
                    <div>
                        <Label className="text-xs font-light">Quantity<span className="text-destructive">*</span></Label>
                        <Input
                            type="number"
                            value={variant.quantity}
                            onChange={(e) => handleVariantChange(variant.id, 'quantity', parseInt(e.target.value) || 0)}
                            placeholder="e.g. 10"
                            className="mt-1"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Color Picker Button */}
                    <div>
                        <Label className="text-xs font-light">Color<span className="text-destructive">*</span></Label>
                        <button
                            type="button"
                            onClick={() => setColorPickerOpen(variant.id)}
                            disabled={isLoading}
                            className="mt-1 w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center gap-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div 
                                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: variant.color }}
                            />
                            <span className="text-sm font-mono">{variant.color}</span>
                        </button>

                        {/* Color Picker Popup */}
                        <ColorPickerPopup
                            isOpen={colorPickerOpen === variant.id}
                            onClose={() => setColorPickerOpen(null)}
                            selectedColor={variant.color}
                            onColorChange={(newColor) => {
                                handleVariantChange(variant.id, 'color', newColor);
                            }}
                        />
                    </div>
                </div>
                
                {variants.length > 1 && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className="mt-4"
                        disabled={isLoading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        ))}
        <Button
            variant="outline"
            className="mt-4 px-4 py-2 text-sm flex items-center gap-2"
            onClick={handleAddVariant}
            disabled={isLoading}
        >
            <Check className="h-4 w-4" />
            Add Another Variant
        </Button>
    </div>
)}
                        </div>
                        <div className='w-full md:w-[50%]'>
                            <h2 className="text-sm font-semibold"> Product Image</h2>
                            <p className="text-xs text-muted-foreground">Upload product images (max 5)</p>
                            <div className='border border-dashed border-[#4FCA6A] rounded-lg w-full h-75 mt-4 flex flex-col items-center justify-center gap-3 py-3'>
                                <ImageIcon />
                                <Label
                                    htmlFor="picture"
                                    className={`flex items-center justify-center border rounded-lg p-2 ${
                                        isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent'
                                    }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
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
                                    disabled={isLoading}
                                />
                                <p className='text-xs text-[#A0A0A0]'>PNG,JPG,GIF up to 10MB, max 5 images</p>
                            </div>
                            {uploadedImages.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {uploadedImages.map((image) => (
                                            <div key={image.id} className="relative w-10 h-10">
                                                <div className="relative w-full h-full rounded border overflow-hidden">
                                                    <Image
                                                        src={URL.createObjectURL(image.file)}
                                                        alt="Uploaded product"
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
                                        <p className="text-xs text-destructive mt-2">
                                            Maximum 5 images reached
                                        </p>
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
                                    Adding Product...
                                </>
                            ) : (
                                'Add Product'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}