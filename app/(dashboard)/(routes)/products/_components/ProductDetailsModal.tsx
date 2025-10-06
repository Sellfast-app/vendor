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
import { ChevronRight, Edit, Trash, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import FlashIcon from "@/components/svgIcons/FlashIcon";
import SaveIcon from "@/components/svgIcons/SaveIcon";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface Product {
    sku: string;
    productName: string;
    description?: string;
    stock: number;
    remanent: number;
    sales: number;
    status: string;
    createdAt: string;
    thumbnail: string | string[]; // Can be string or array of strings
    variants?: { id: string; size: string | number; color: string; price: number; quantity: number }[];
}

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (product: Product) => void;
    onDelete: (sku: string) => void;
    product: Product | null;
    isEditMode?: boolean; // True if opened directly for editing from table
}

export default function ProductDetailsModal({ isOpen, onClose, onEdit, onDelete, product, isEditMode = false }: ProductDetailsModalProps) {
    const [localProduct, setLocalProduct] = useState<Product | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        console.log("ProductDetailsModal updating with product:", product, "Initial Edit Mode:", isEditMode);
        setLocalProduct(product);
        setEditMode(isEditMode); // Set edit mode if opened directly for editing
        setCurrentImageIndex(0); // Reset image index when product changes
    }, [product, isEditMode]);


    // Helper function to get current image URL for slider
    const getCurrentImageUrl = (): string => {
        if (!localProduct?.thumbnail) return '/thumbnails/default.png';
        
        if (Array.isArray(localProduct.thumbnail)) {
            return localProduct.thumbnail[currentImageIndex] || '/thumbnails/default.png';
        }
        return localProduct.thumbnail;
    };

    const handleInputChange = (field: keyof Product, value: string | number) => {
        if (localProduct) {
            setLocalProduct(prev => prev ? { ...prev, [field]: value } : null);
        }
    };

    const handleSave = () => {
        if (localProduct) {
            onEdit(localProduct);
            setEditMode(false); // Exit edit mode after saving
        }
    };

    const handleCancel = () => {
        setEditMode(false); // Revert to view mode
        setLocalProduct(product); // Reset to original product data
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "Ready Stock":
                return "bg-[#EFFFE9] text-[#53DC19]";
            case "Made-to-order":
                return "bg-[#FFF5E8] text-[#FFB347]";
            case "Out of Stock":
                return "bg-[#FFEFEF] text-[#E40101]";
            default:
                return "";
        }
    };

    const handleDeleteClick = () => {
        if (localProduct) onDelete(localProduct.sku);
    };

    // Image slider navigation
    const handleNextImage = () => {
        if (localProduct && localProduct.thumbnail && Array.isArray(localProduct.thumbnail)) {
            setCurrentImageIndex((prev) => (prev + 1) % localProduct.thumbnail.length);
        }
    };

    const handlePrevImage = () => {
        if (localProduct && localProduct.thumbnail && Array.isArray(localProduct.thumbnail)) {
            setCurrentImageIndex((prev) => (prev - 1 + localProduct.thumbnail.length) % localProduct.thumbnail.length);
        }
    };

    // Determine if thumbnail is an array (multiple images) or a single string
    const isMultipleImages = localProduct?.thumbnail && Array.isArray(localProduct.thumbnail);
    const currentImageUrl = getCurrentImageUrl();
    const totalImages = isMultipleImages ? localProduct.thumbnail.length : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[750px] border-none rounded-lg p-6 bg-card overflow-y-auto max-h-[90vh]">
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
                                {isMultipleImages && totalImages > 1 && (
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

                            {/* Product Insight */}
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="font-medium text-sm">Product Insights</span>
                                    <FlashIcon />
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <Label className="text-muted-foreground">Total Sales</Label>
                                        <p className="font-semibold">{localProduct.sales.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Total Revenue</Label>
                                        <p className="font-semibold">₦{(localProduct.sales * 0.9).toLocaleString()}</p>
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
                                    className={`bg-muted min-h-[100px] resize-none ${!editMode ? 'bg-muted' : ''}`}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="price" className="text-xs mb-1">Price</Label>
                                    <Input
                                        id="price"
                                        value={localProduct.sales.toLocaleString()}
                                        onChange={(e) => handleInputChange('sales', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                                        readOnly={!editMode}
                                        className={`bg-muted ${!editMode ? 'bg-muted' : ''}`}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="discount" className="text-xs mb-1">Discount</Label>
                                    <Input
                                        id="discount"
                                        value="10%"
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="quantity" className="text-xs mb-1">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        value={localProduct.stock.toString()}
                                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                        readOnly={!editMode}
                                        className={`bg-muted ${!editMode ? 'bg-muted' : ''}`}
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
                            <div>
                                <Label htmlFor="deliveryNote" className="text-xs mb-1">Delivery Note</Label>
                                <Textarea
                                    id="deliveryNote"
                                    value={localProduct.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    readOnly={!editMode}
                                    className={`bg-muted min-h-[100px] resize-none ${!editMode ? 'bg-muted' : ''}`}
                                    placeholder="Tell us about your product..."
                                />
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
                            <Button variant="outline" size="sm" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button variant="default" size="sm" onClick={handleSave}>
                                <SaveIcon /> Save
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