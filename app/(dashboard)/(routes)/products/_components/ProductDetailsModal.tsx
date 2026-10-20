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
import { ChevronRight, Edit, Trash, ChevronLeft, Upload, X, Plus } from "lucide-react";
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
    variants?: { id: string; name?: string; size: string | number; color: string; sku?: string; price: number; quantity: number }[];
    bundleItems?: { productId: string; productName: string; sku: string; quantity: number }[];
    shortDescription?: string;
    costPrice?: number | null;
    compareAtPrice?: number | null;
    unit?: string;
    barcode?: string;
    collection?: string;
    sizeChartUrl?: string;
    minOrderQuantity?: number | null;
    maxOrderQuantity?: number | null;
    location?: string;
    // New fields for API
    product_weight?: number;
    est_prod_days_from?: number;
    est_prod_days_to?: number;
    product_type?: string;
}

interface AvailableProduct {
    id: string;
    productName: string;
    sku: string;
    stock: number;
    productType?: string;
    product_type?: string;
}

interface ApiProduct {
    id: string;
    product_sku?: string | null;
    product_name?: string | null;
    product_description?: string | null;
    product_quantity?: number | string | null;
    product_price?: number | string | null;
    product_status?: string | null;
    created_at?: string;
    product_images?: string[] | null;
    variants?: Array<{ id?: string; name?: string; size?: string | number; color?: string; sku?: string; price?: number | string; quantity?: number | string }>;
    bundle_items?: Array<{ product_id: string; product_name?: string; product_sku?: string; quantity?: number | string }>;
    short_description?: string | null;
    cost_price?: number | string | null;
    compare_at_price?: number | string | null;
    product_unit?: string | null;
    barcode?: string | null;
    collection_name?: string | null;
    size_chart_url?: string | null;
    min_order_quantity?: number | null;
    max_order_quantity?: number | null;
    store_location?: string | null;
    product_weight?: number | string | null;
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
    availableProducts?: AvailableProduct[];
    isEditMode?: boolean;
}

export default function ProductDetailsModal({ isOpen, onClose, onEdit, onDelete, product, availableProducts = [], isEditMode = false }: ProductDetailsModalProps) {
    const [localProduct, setLocalProduct] = useState<FrontendProduct | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [removedImages, setRemovedImages] = useState<string[]>([]);
    const [bundleProductToAdd, setBundleProductToAdd] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalProduct(product);
        setEditMode(isEditMode);
        setCurrentImageIndex(0);
        setNewImages([]);
        setRemovedImages([]);
        setBundleProductToAdd("");
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

    const handleInputChange = (field: keyof FrontendProduct, value: string | number | null) => {
        if (localProduct) {
            setLocalProduct(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const updateVariant = (index: number, field: "name" | "size" | "color" | "sku" | "price" | "quantity", value: string) => {
        if (!localProduct) return;
        const variants = [...(localProduct.variants || [])];
        variants[index] = { ...variants[index], [field]: field === "price" || field === "quantity" ? Number(value) || 0 : value };
        setLocalProduct({ ...localProduct, variants });
    };

    const addBundleProduct = () => {
        if (!localProduct || !bundleProductToAdd) return;
        const item = availableProducts.find((candidate) => candidate.id === bundleProductToAdd);
        if (!item || (item.productType || item.product_type) === "bundle" || localProduct.bundleItems?.some((entry) => entry.productId === item.id)) return;
        setLocalProduct({ ...localProduct, bundleItems: [...(localProduct.bundleItems || []), { productId: item.id, productName: item.productName, sku: item.sku, quantity: 1 }] });
        setBundleProductToAdd("");
    };

    const handleSave = async () => {
        if (!localProduct) return;
      
        // Validate that we have a product ID
        if (!localProduct.id) {
            toast.error('Product ID is missing. Cannot update product.');
            return;
        }
      
        setIsLoading(true);
        try {
          // Prepare form data for PATCH request
          const formData = new FormData();
      
          formData.append('name', localProduct.productName);
          formData.append('status', mapStatusToApi(localProduct.status));
          formData.append('price', localProduct.sales.toString());
          formData.append('quantity', localProduct.stock.toString());
          formData.append('description', localProduct.description || '');
          formData.append('short_description', localProduct.shortDescription || '');
          formData.append('cost_price', localProduct.costPrice?.toString() || '');
          formData.append('compare_at_price', localProduct.compareAtPrice?.toString() || '');
          formData.append('est_prod_days_from', String(localProduct.est_prod_days_from ?? 0));
          formData.append('est_prod_days_to', String(localProduct.est_prod_days_to ?? 0));
          formData.append('weight', String(localProduct.product_weight || 1));
          formData.append('unit', localProduct.unit || '');
          formData.append('barcode', localProduct.barcode || '');
          formData.append('collection', localProduct.collection || '');
          formData.append('size_chart_url', localProduct.sizeChartUrl || '');
          formData.append('min_order_quantity', localProduct.minOrderQuantity?.toString() || '');
          formData.append('max_order_quantity', localProduct.maxOrderQuantity?.toString() || '');
          formData.append('location', localProduct.location || '');
          formData.append('variants', JSON.stringify(localProduct.variants || []));
          formData.append('bundle_items', JSON.stringify((localProduct.bundleItems || []).map(item => ({
            product_id: item.productId,
            quantity: item.quantity,
          }))));
          if (allImages.length > 5) throw new Error('A product can have at most five images.');
          formData.append('existing_images', JSON.stringify(existingImages));
      
          // Add new images
          newImages.forEach((file) => {
            formData.append('files', file);
          });
      
          const apiUrl = `/api/products/${localProduct.id}`;
      
          const response = await fetch(apiUrl, {
            method: 'PATCH',
            body: formData,
          });
      
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update product');
          }
      
          const result = await response.json();
      
          if (result.status === 'success') {
            const productData = result.data || result.datat;
            if (!productData) {
              throw new Error('No product data returned from server');
            }
            
            // Update local product with the response data
            const updatedProduct = transformProduct(productData);
            onEdit(updatedProduct);
            setEditMode(false);
            setNewImages([]);
            setRemovedImages([]);
            toast.success('Product updated successfully!');
          } else {
            throw new Error(result.message || 'Failed to update product');
          }
        } catch (error) {
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

    const transformProduct = (apiProduct: ApiProduct): FrontendProduct => ({
        id: apiProduct.id,
        sku: apiProduct.product_sku || "",
        productName: apiProduct.product_name || "",
        description: apiProduct.product_description || "",
        stock: Number(apiProduct.product_quantity || 0),
        remanent: Number(apiProduct.product_quantity || 0),
        sales: Number(apiProduct.product_price || 0),
        status: mapStatusFromApi(apiProduct.product_status || ""),
        createdAt: apiProduct.created_at || "",
        thumbnail: Array.isArray(apiProduct.product_images) ? apiProduct.product_images : [],
        variants: Array.isArray(apiProduct.variants) ? apiProduct.variants.map((variant, index) => ({
            id: String(variant.id || `${apiProduct.id}-variant-${index}`),
            name: String(variant.name || variant.size || ""),
            size: variant.size || "",
            color: String(variant.color || ""),
            sku: String(variant.sku || ""),
            price: Number(variant.price ?? apiProduct.product_price ?? 0),
            quantity: Number(variant.quantity || 0),
        })) : [],
        bundleItems: Array.isArray(apiProduct.bundle_items) ? apiProduct.bundle_items.map((item) => ({
            productId: String(item.product_id),
            productName: String(item.product_name || "Product"),
            sku: String(item.product_sku || ""),
            quantity: Number(item.quantity || 1),
        })) : [],
        shortDescription: apiProduct.short_description || "",
        costPrice: apiProduct.cost_price == null ? null : Number(apiProduct.cost_price),
        compareAtPrice: apiProduct.compare_at_price == null ? null : Number(apiProduct.compare_at_price),
        unit: apiProduct.product_unit || "",
        barcode: apiProduct.barcode || "",
        collection: apiProduct.collection_name || "",
        sizeChartUrl: apiProduct.size_chart_url || "",
        minOrderQuantity: apiProduct.min_order_quantity ?? null,
        maxOrderQuantity: apiProduct.max_order_quantity ?? null,
        location: apiProduct.store_location || "",
        product_weight: apiProduct.product_weight ? Number(apiProduct.product_weight) : undefined,
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
                            {editMode && <div>
                                <Label htmlFor="shortDescription" className="text-xs mb-1">Short description</Label>
                                <Input id="shortDescription" maxLength={180} value={localProduct.shortDescription || ""} onChange={(e) => handleInputChange("shortDescription", e.target.value)} />
                            </div>}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label className="text-xs mb-1">Cost price</Label><Input type="number" min="0" value={localProduct.costPrice ?? ""} readOnly={!editMode} onChange={(e) => handleInputChange("costPrice", e.target.value === "" ? null : Number(e.target.value))} /></div>
                                <div><Label className="text-xs mb-1">Compare-at price</Label><Input type="number" min="0" value={localProduct.compareAtPrice ?? ""} readOnly={!editMode} onChange={(e) => handleInputChange("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label className="text-xs mb-1">Unit</Label><Input value={localProduct.unit || ""} readOnly={!editMode} onChange={(e) => handleInputChange("unit", e.target.value)} /></div>
                                <div><Label className="text-xs mb-1">Barcode</Label><Input value={localProduct.barcode || ""} readOnly={!editMode} onChange={(e) => handleInputChange("barcode", e.target.value)} /></div>
                                <div><Label className="text-xs mb-1">Collection</Label><Input value={localProduct.collection || ""} readOnly={!editMode} onChange={(e) => handleInputChange("collection", e.target.value)} /></div>
                                <div><Label className="text-xs mb-1">Size chart URL</Label><Input value={localProduct.sizeChartUrl || ""} readOnly={!editMode} onChange={(e) => handleInputChange("sizeChartUrl", e.target.value)} /></div>
                                <div><Label className="text-xs mb-1">Minimum order quantity</Label><Input type="number" min="1" value={localProduct.minOrderQuantity ?? ""} readOnly={!editMode} onChange={(e) => handleInputChange("minOrderQuantity", e.target.value === "" ? null : Number(e.target.value))} /></div>
                                <div><Label className="text-xs mb-1">Maximum order quantity</Label><Input type="number" min="1" value={localProduct.maxOrderQuantity ?? ""} readOnly={!editMode} onChange={(e) => handleInputChange("maxOrderQuantity", e.target.value === "" ? null : Number(e.target.value))} /></div>
                                <div><Label className="text-xs mb-1">Store location</Label><Input value={localProduct.location || ""} readOnly={!editMode} onChange={(e) => handleInputChange("location", e.target.value)} /></div>
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
                            {localProduct.product_type === "variant" && (
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="variants">
                                        <AccordionTrigger className="text-sm font-medium">Variants</AccordionTrigger>
                                        <AccordionContent>
                                            {(localProduct.variants || []).map((variant, index) => (
                                                <div key={variant.id || index} className="grid grid-cols-2 md:grid-cols-[repeat(3,minmax(0,1fr))_auto] gap-2 py-2 border-b last:border-b-0">
                                                    <Input aria-label="Variant name" value={variant.name || ""} readOnly={!editMode} placeholder="Name" onChange={(e) => updateVariant(index, "name", e.target.value)} />
                                                    <Input aria-label="Variant size" value={variant.size} readOnly={!editMode} placeholder="Size" onChange={(e) => updateVariant(index, "size", e.target.value)} />
                                                    <Input aria-label="Variant color" value={variant.color} readOnly={!editMode} placeholder="Color" onChange={(e) => updateVariant(index, "color", e.target.value)} />
                                                    <Input aria-label="Variant SKU" value={variant.sku || ""} readOnly={!editMode} placeholder="SKU" onChange={(e) => updateVariant(index, "sku", e.target.value)} />
                                                    <Input aria-label="Variant price" type="number" min="0" value={variant.price} readOnly={!editMode} placeholder="Price" onChange={(e) => updateVariant(index, "price", e.target.value)} />
                                                    <Input aria-label="Variant quantity" type="number" min="0" value={variant.quantity} readOnly={!editMode} placeholder="Quantity" onChange={(e) => updateVariant(index, "quantity", e.target.value)} />
                                                    {editMode && <Button type="button" variant="ghost" size="icon" aria-label="Remove variant" onClick={() => setLocalProduct({ ...localProduct, variants: (localProduct.variants || []).filter((_, variantIndex) => variantIndex !== index) })}><X className="h-4 w-4" /></Button>}
                                                </div>
                                            ))}
                                            {editMode && <Button type="button" variant="outline" size="sm" onClick={() => setLocalProduct({ ...localProduct, variants: [...(localProduct.variants || []), { id: `new-${Date.now()}`, name: "", size: "", color: "", sku: "", price: localProduct.sales, quantity: 0 }] })}><Plus className="h-4 w-4 mr-1" /> Add variant</Button>}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}

                            {localProduct.product_type === "bundle" && <section className="space-y-2 rounded-md border p-3">
                                <h3 className="text-sm font-medium">Bundle contents</h3>
                                {(localProduct.bundleItems || []).map((item) => <div key={item.productId} className="grid grid-cols-[1fr_90px_auto] items-center gap-2">
                                    <span className="text-sm">{item.productName} <span className="text-muted-foreground">{item.sku}</span></span>
                                    <Input type="number" min="1" value={item.quantity} readOnly={!editMode} aria-label={`Quantity of ${item.productName}`} onChange={(e) => setLocalProduct({ ...localProduct, bundleItems: (localProduct.bundleItems || []).map((entry) => entry.productId === item.productId ? { ...entry, quantity: Number(e.target.value) || 1 } : entry) })} />
                                    {editMode && <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${item.productName}`} onClick={() => setLocalProduct({ ...localProduct, bundleItems: (localProduct.bundleItems || []).filter((entry) => entry.productId !== item.productId) })}><X className="h-4 w-4" /></Button>}
                                </div>)}
                                {editMode && <div className="flex gap-2"><Select value={bundleProductToAdd} onValueChange={setBundleProductToAdd}><SelectTrigger><SelectValue placeholder="Add a product" /></SelectTrigger><SelectContent>{availableProducts.filter((candidate) => candidate.id !== localProduct.id && (candidate.productType || candidate.product_type) !== "bundle" && !localProduct.bundleItems?.some((item) => item.productId === candidate.id)).map((candidate) => <SelectItem key={candidate.id} value={candidate.id}>{candidate.productName}</SelectItem>)}</SelectContent></Select><Button type="button" variant="outline" onClick={addBundleProduct} disabled={!bundleProductToAdd}><Plus className="h-4 w-4" /></Button></div>}
                            </section>}
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
