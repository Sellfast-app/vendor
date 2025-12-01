"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Edit, Trash, ChevronLeft, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import FlashIcon from "@/components/svgIcons/FlashIcon";
import SaveIcon from "@/components/svgIcons/SaveIcon";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

interface FrontendProduct {
    id: string;
    sku: string;
    productName: string;
    description?: string;
    stock: number;
    remanent: number;
    sales: number;
    status: string;
    createdAt: string;
    thumbnail: string | string[];
    variants?: { id: string; size: string | number; color: string; price: number; quantity: number }[];
    // New fields for API
    product_weight?: number;
    est_prod_days_from?: number;
    est_prod_days_to?: number;
    product_type?: string;
}

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (product: FrontendProduct) => void;
    onDelete: (product: FrontendProduct) => void;
    product: FrontendProduct | null;
    isEditMode?: boolean;
}

export default function ProductDetailsModal({ isOpen, onClose, onEdit, onDelete, product, isEditMode = false }: ProductDetailsModalProps) {
    const [localProduct, setLocalProduct] = useState<FrontendProduct | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [removedImages, setRemovedImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log("ProductDetailsModal updating with product:", product, "Initial Edit Mode:", isEditMode);
        setLocalProduct(product);
        setEditMode(isEditMode);
        setCurrentImageIndex(0);
        setNewImages([]);
        setRemovedImages([]);
    }, [product, isEditMode]);

    // Helper function to get current image URL for slider
    const getCurrentImageUrl = (): string => {
        if (!localProduct?.thumbnail) return '/thumbnails/default.png';
        
        if (Array.isArray(localProduct.thumbnail)) {
            const availableImages = localProduct.thumbnail.filter(img => !removedImages.includes(img));
            return availableImages[currentImageIndex] || '/thumbnails/default.png';
        }
        return localProduct.thumbnail;
    };

    const handleInputChange = (field: keyof FrontendProduct, value: string | number) => {
        if (localProduct) {
            setLocalProduct(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const handleSave = async () => {
        if (!localProduct) return;
      
        console.log('🔄 Starting product update process...');
        console.log('📝 Local Product Data:', {
          id: localProduct.id,
          productName: localProduct.productName,
          sales: localProduct.sales,
          stock: localProduct.stock,
          status: localProduct.status,
          description: localProduct.description,
          product_weight: localProduct.product_weight,
          est_prod_days_from: localProduct.est_prod_days_from,
          est_prod_days_to: localProduct.est_prod_days_to
        });

        // Validate that we have a product ID
        if (!localProduct.id) {
            console.error('❌ Product ID is missing!');
            toast.error('Product ID is missing. Cannot update product.');
            return;
        }
      
        setIsLoading(true);
        try {
          // Prepare form data for PATCH request
          const formData = new FormData();
      
          // NOTE: The store_id should NOT be the product ID!
          // The API will get the store_id from cookies in the backend
          // We only need to pass the product-specific fields
          
          // Required fields from API docs - status is required
          formData.append('status', mapStatusToApi(localProduct.status));
          
          // Optional fields - only include if they have values
          if (localProduct.productName) formData.append('name', localProduct.productName);
          if (localProduct.sales) formData.append('price', localProduct.sales.toString());
          if (localProduct.stock) formData.append('quantity', localProduct.stock.toString());
          if (localProduct.description) formData.append('description', localProduct.description);
          if (localProduct.est_prod_days_from) formData.append('est_prod_days_from', localProduct.est_prod_days_from.toString());
          if (localProduct.est_prod_days_to) formData.append('est_prod_days_to', localProduct.est_prod_days_to.toString());
          if (localProduct.product_weight) formData.append('weight', localProduct.product_weight.toString());
      
          // Add new images
          newImages.forEach((file) => {
            formData.append('files', file);
          });
      
          console.log('🔄 Updating product with data:', {
            productId: localProduct.id,
            status: mapStatusToApi(localProduct.status),
            name: localProduct.productName,
            price: localProduct.sales,
            quantity: localProduct.stock,
            description: localProduct.description,
            est_prod_days_from: localProduct.est_prod_days_from,
            est_prod_days_to: localProduct.est_prod_days_to,
            weight: localProduct.product_weight,
            newImages: newImages.length
          });
      
          // Log the actual URL being called - FIXED: use localProduct.id instead of product.id
          const apiUrl = `/api/products/${localProduct.id}`;
          console.log('🔗 Calling API URL:', apiUrl);
      
          // Log form data being sent
          console.log('📦 FormData contents:');
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              console.log(`  ${key}: File - ${value.name}`);
            } else {
              console.log(`  ${key}:`, value);
            }
          }
      
          // Use the dynamic route: /api/products/[productId]
          const response = await fetch(apiUrl, {
            method: 'PATCH',
            body: formData,
          });
      
          console.log('📡 API Response Status:', response.status);
          console.log('📡 API Response URL:', response.url);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ API Error Response:', errorData);
            throw new Error(errorData.message || 'Failed to update product');
          }
      
          const result = await response.json();
          console.log('✅ API Success Response:', result);
      
          if (result.status === 'success') {
            // Update local product with the response data
            const updatedProduct = transformProduct(result.data);
            onEdit(updatedProduct);
            setEditMode(false);
            setNewImages([]);
            setRemovedImages([]);
            toast.success('Product updated successfully!');
          } else {
            throw new Error(result.message || 'Failed to update product');
          }
        } catch (error) {
          console.error('Error updating product:', error);
          toast.error(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsLoading(false);
        }
      };

    const handleCancel = () => {
        setEditMode(false);
        setLocalProduct(product);
        setNewImages([]);
        setRemovedImages([]);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "Ready Stock":
                return "bg-[#EFFFE9] text-[#065F46]";
            case "Made-to-order":
                return "bg-[#FFF5E8] text-[#9A3412]";
            case "Out of Stock":
                return "bg-[#FFEFEF] text-[#991B1B]";
            default:
                return "";
        }
    };

    const handleDeleteClick = () => {
        if (localProduct) onDelete(localProduct);
    };

    // Image slider navigation
    const handleNextImage = () => {
        if (localProduct && localProduct.thumbnail && Array.isArray(localProduct.thumbnail)) {
            const availableImages = localProduct.thumbnail.filter(img => !removedImages.includes(img));
            setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
        }
    };

    const handlePrevImage = () => {
        if (localProduct && localProduct.thumbnail && Array.isArray(localProduct.thumbnail)) {
            const availableImages = localProduct.thumbnail.filter(img => !removedImages.includes(img));
            setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
        }
    };

    // Image management functions
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFiles = Array.from(files);
            setNewImages(prev => [...prev, ...newFiles]);
        }
    };

    const handleRemoveNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (imageUrl: string) => {
        setRemovedImages(prev => [...prev, imageUrl]);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformProduct = (apiProduct: any): FrontendProduct => ({
        id: apiProduct.id,
        sku: apiProduct.product_sku,
        productName: apiProduct.product_name,
        description: apiProduct.product_description,
        stock: apiProduct.product_quantity,
        remanent: apiProduct.product_quantity,
        sales: parseFloat(apiProduct.product_price) || 0,
        status: mapStatusFromApi(apiProduct.product_status),
        createdAt: apiProduct.created_at,
        thumbnail: apiProduct.product_images || [],
        variants: Array.isArray(apiProduct.variants) ? apiProduct.variants : [],
        product_weight: apiProduct.product_weight ? parseFloat(apiProduct.product_weight) : undefined,
        est_prod_days_from: apiProduct.est_prod_days_from,
        est_prod_days_to: apiProduct.est_prod_days_to,
        product_type: apiProduct.product_type,
    });

    const mapStatusFromApi = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'ready': 'Ready Stock',
            'made-to-order': 'Made-to-order',
            'out-of-stock': 'Out of Stock'
        };
        return statusMap[status] || 'Ready Stock';
    };

    const mapStatusToApi = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'Ready Stock': 'ready',
            'Made-to-order': 'made-to-order',
            'Out of Stock': 'out-of-stock'
        };
        return statusMap[status] || 'ready';
    };

    // Get all images (existing + new)
    const existingImages = localProduct?.thumbnail && Array.isArray(localProduct.thumbnail) 
        ? localProduct.thumbnail.filter(img => !removedImages.includes(img))
        : [];
    
    const allImages = [
        ...existingImages,
        ...newImages.map(file => URL.createObjectURL(file))
    ];

    const currentImageUrl = getCurrentImageUrl();
    const totalImages = allImages.length;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] border-none rounded-lg p-6 bg-card overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-sm">
                        {editMode ? "Edit Product" : "Product Details"}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {editMode ? "Update product information" : "This is all product information"}
                    </DialogDescription>
                </DialogHeader>

                {localProduct ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        {/* Left Column - Product Image */}
                        <div className="space-y-4">
                            <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                <Image
                                    src={currentImageUrl}
                                    alt={localProduct.productName}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/thumbnails/default.png'; }}
                                />
                                {totalImages > 1 && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                                            onClick={handlePrevImage}
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                                            onClick={handleNextImage}
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </Button>
                                        {/* Image counter */}
                                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                                            {currentImageIndex + 1} / {totalImages}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Image Management in Edit Mode */}
                            {editMode && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Product Images</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={triggerFileInput}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Add Images
                                        </Button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </div>
                                    
                                    {/* Image Thumbnails */}
                                    <div className="grid grid-cols-4 gap-2">
                                        {/* Existing images */}
                                        {localProduct.thumbnail && Array.isArray(localProduct.thumbnail) && 
                                            localProduct.thumbnail.map((img, index) => (
                                                !removedImages.includes(img) && (
                                                    <div key={index} className="relative group">
                                                        <Image
                                                            src={img}
                                                            alt={`Product image ${index + 1}`}
                                                            width={80}
                                                            height={80}
                                                            className="rounded-md object-cover"
                                                        />
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleRemoveExistingImage(img)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )
                                            ))
                                        }
                                        {/* New images */}
                                        {newImages.map((file, index) => (
                                            <div key={`new-${index}`} className="relative group">
                                                <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={`New image ${index + 1}`}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-md object-cover"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemoveNewImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product Insight */}
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="font-medium text-sm">Product Insights</span>
                                    <FlashIcon />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground">Total Sales</Label>
                                        <p className="font-semibold">0</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Total Revenue</Label>
                                        <p className="font-semibold">₦0</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Total Ratings</Label>
                                        <p className="font-semibold">4.5/5</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Stock Quantity</Label>
                                        <p className="font-semibold">{localProduct.stock}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Product Data */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="sku" className="text-xs mb-1">SKU and Product Name</Label>
                                <div className="flex flex-col md:flex-row gap-1">
                                    <Input
                                        id="sku"
                                        value={localProduct.sku}
                                        readOnly
                                        className="bg-muted w-full md:w-1/3 mb-2 md:mb-0"
                                    />
                                    <Input
                                        id="productName"
                                        value={localProduct.productName}
                                        onChange={(e) => handleInputChange('productName', e.target.value)}
                                        readOnly={!editMode}
                                        className={`w-full md:w-2/3 ${!editMode ? 'bg-muted' : ''}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="description" className="text-xs mb-1">Description</Label>
                                <Textarea
                                    id="description"
                                    value={localProduct.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    readOnly={!editMode}
                                    className={`min-h-[100px] resize-none ${!editMode ? 'bg-muted' : ''}`}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="price" className="text-xs mb-1">Price (₦)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={localProduct.sales}
                                        onChange={(e) => handleInputChange('sales', parseInt(e.target.value) || 0)}
                                        readOnly={!editMode}
                                        className={!editMode ? 'bg-muted' : ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="quantity" className="text-xs mb-1">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={localProduct.stock}
                                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                        readOnly={!editMode}
                                        className={!editMode ? 'bg-muted' : ''}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="weight" className="text-xs mb-1">Weight (kg)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.01"
                                        value={localProduct.product_weight || ''}
                                        onChange={(e) => handleInputChange('product_weight', parseFloat(e.target.value) || 0)}
                                        readOnly={!editMode}
                                        className={!editMode ? 'bg-muted' : ''}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="est_prod_days_from" className="text-xs mb-1">Production Days (From)</Label>
                                    <Input
                                        id="est_prod_days_from"
                                        type="number"
                                        value={localProduct.est_prod_days_from || ''}
                                        onChange={(e) => handleInputChange('est_prod_days_from', parseInt(e.target.value) || 0)}
                                        readOnly={!editMode}
                                        className={!editMode ? 'bg-muted' : ''}
                                        placeholder="Minimum days"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="est_prod_days_to" className="text-xs mb-1">Production Days (To)</Label>
                                    <Input
                                        id="est_prod_days_to"
                                        type="number"
                                        value={localProduct.est_prod_days_to || ''}
                                        onChange={(e) => handleInputChange('est_prod_days_to', parseInt(e.target.value) || 0)}
                                        readOnly={!editMode}
                                        className={!editMode ? 'bg-muted' : ''}
                                        placeholder="Maximum days"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="status" className="text-xs mb-1">Status</Label>
                                <Select
                                    value={localProduct.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                    disabled={!editMode}
                                >
                                    <SelectTrigger className={`w-full py-2 rounded-md text-sm ${getStatusClass(localProduct.status)}`}>
                                        <SelectValue placeholder={localProduct.status}>
                                            <span className="flex items-center gap-2 font-medium">
                                                <span className={`w-2 h-2 rounded-full ${localProduct.status === "Ready Stock" ? "bg-[#53DC19]" :
                                                    localProduct.status === "Made-to-order" ? "bg-[#FFB347]" :
                                                        "bg-[#E40101]"
                                                    }`} />
                                                {localProduct.status}
                                            </span>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ready Stock">Ready Stock</SelectItem>
                                        <SelectItem value="Made-to-order">Made-to-order</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Variants Accordion */}
                            {localProduct.variants && localProduct.variants.length > 0 && (
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="variants">
                                        <AccordionTrigger className="text-sm font-medium">Variants</AccordionTrigger>
                                        <AccordionContent>
                                            {localProduct.variants.map((variant) => (
                                                <div key={variant.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                                    <div className="flex items-center space-x-4">
                                                        <span
                                                            className="w-6 h-6 rounded-full inline-block"
                                                            style={{ backgroundColor: variant.color }}
                                                        />
                                                        <span>{variant.size}</span>
                                                        <span>₦{variant.price.toLocaleString()}</span>
                                                        <span>{variant.quantity}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center items-center py-8">
                        <p className="text-muted-foreground">No product data available</p>
                    </div>
                )}
                <div className="flex justify-end gap-2 border-t pt-3.5">
                    {editMode ? (
                        <>
                            <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button variant="default" size="sm" onClick={handleSave} disabled={isLoading}>
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <SaveIcon />
                                )}
                                {isLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setEditMode(true)} disabled={!localProduct}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleDeleteClick} disabled={!localProduct}>
                                <Trash className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}