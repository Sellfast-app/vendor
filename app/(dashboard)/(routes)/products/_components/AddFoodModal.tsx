"use client";

import ImageIcon from '@/components/svgIcons/Image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X, CircleCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import BundleConfiguration, { BundleAddOnGroup } from './BundleConfiguration';
import CustomizationOptions from './CustomizationOptions';
import PortionSetup from './PortionSetup';

// ─── Types (shared with sub-components) ──────────────────────────────────────

export interface PortionSize {
    id: string;
    name: string;
    price: string;
    prepTimeStart: string;
    prepTimeEnd: string;
    servings: string;
    servingUnit: string;
}

export interface AddOnOption {
    id: string;
    name: string;
    price: string;
}

export interface SavedGroup {
    id: string;
    groupName: string;
    selection: 'single' | 'multiple';
    maxSelections: number;
    isRequired: boolean;
    options: AddOnOption[];
}

export interface BundleSlot {
    id: string;
    name: string;
    price: string;
    category: string;
    maxItems: number;
    isRequired: boolean;
}

interface ApiServingTypePrice {
    servingType?: string;
    name?: string;
    type?: string;
    price?: number | string;
}

export interface EditableFoodItem {
    uid: string;
    name: string;
    description?: string;
    product_images?: string[];
    type: string;
    status: string;
    availability: string;
    servingType?: string[];
    servingTypePricing?: ApiServingTypePrice[];
    servingTypePrices?: ApiServingTypePrice[];
    category?: string[];
    labels?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addOnGroup?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    portion?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bundleConfig?: any[];
}

interface ApiAddOnOption {
    uid?: string;
    id?: string;
    name?: string;
    price?: number | string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddFoodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFoodAdded?: () => void;
    onFoodUpdated?: () => void;
    editFoodItem?: EditableFoodItem | null;
}

interface UploadedImage {
    file: File;
    progress: number;
    isUploading: boolean;
    id: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddFoodModal({ isOpen, onClose, onFoodAdded, onFoodUpdated, editFoodItem }: AddFoodModalProps) {
    // ── Basic fields ──────────────────────────────────────────────────────────
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [productType, setProductType] = useState<'simple' | 'customizable' | 'bundle'>('simple');
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [timeAvailability, setTimeAvailability] = useState('');
    const [servingType, setServingType] = useState('');
    const [servingTypeCustom, setServingTypeCustom] = useState('');
    const [servingTypes, setServingTypes] = useState<string[]>([]);
    const [servingTypePrices, setServingTypePrices] = useState<Record<string, string>>({});
    const [foodCategory, setFoodCategory] = useState('');
    const [foodCategoryCustom, setFoodCategoryCustom] = useState('');
    const [foodCategories, setFoodCategories] = useState<string[]>([]);
    const [dietaryLabel, setDietaryLabel] = useState('');
    const [dietaryLabelCustom, setDietaryLabelCustom] = useState('');
    const [dietaryLabels, setDietaryLabels] = useState<string[]>([]);
    const [bundleAddOnGroups, setBundleAddOnGroups] = useState<BundleAddOnGroup[]>([]);

    // ── Lifted state from sub-components ─────────────────────────────────────
    // PortionSetup (simple)
    const [portions, setPortions] = useState<PortionSize[]>([]);
    // CustomizationOptions (customizable)
    const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
    // BundleConfiguration (bundle)
    const [bundleSlots, setBundleSlots] = useState<BundleSlot[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditMode = !!editFoodItem;

    useEffect(() => {
        if (!isOpen) return;

        if (!editFoodItem) {
            resetForm();
            return;
        }

        setUploadedImages([]);
        setExistingImages(editFoodItem.product_images || []);
        setProductType(mapFoodTypeToForm(editFoodItem.type));
        setProductName(editFoodItem.name || '');
        setDescription(editFoodItem.description || '');
        setStatus(editFoodItem.status || '');
        setTimeAvailability(editFoodItem.availability || '');
        setServingType('');
        setServingTypeCustom('');
        setServingTypes(editFoodItem.servingType || []);
        setServingTypePrices(mapApiServingTypePricesToForm(editFoodItem));
        setFoodCategory('');
        setFoodCategoryCustom('');
        setFoodCategories(editFoodItem.category || []);
        setDietaryLabel('');
        setDietaryLabelCustom('');
        setDietaryLabels(editFoodItem.labels || []);
        setPortions((editFoodItem.portion || []).map(mapApiPortionToForm));
        setSavedGroups((editFoodItem.addOnGroup || []).map(mapApiAddOnGroupToForm));
        setBundleSlots((editFoodItem.bundleConfig || []).map(mapApiBundleSlotToForm));
        setBundleAddOnGroups((editFoodItem.addOnGroup || []).map(mapApiBundleAddOnGroupToForm));
        setError(null);
    }, [editFoodItem, isOpen]);

    // ── Image upload ──────────────────────────────────────────────────────────

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        if (uploadedImages.length + files.length > 5) return;

        const validFiles: File[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 10 * 1024 * 1024) continue;
            validFiles.push(file);
        }
        if (validFiles.length === 0) return;

        const newImages: UploadedImage[] = validFiles.map((file) => ({
            file,
            progress: 0,
            isUploading: true,
            id: Math.random().toString(36).substr(2, 9),
        }));

        setUploadedImages(prev => [...prev, ...newImages]);

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

    const addServingType = () => {
        const val = (servingTypeCustom.trim() || servingType).trim();
        if (!val) return;
        if (!servingTypes.includes(val)) {
            setServingTypes(prev => [...prev, val]);
            setServingTypePrices(prev => ({ ...prev, [val]: prev[val] || '' }));
        }
        setServingTypeCustom('');
        setServingType('');
    };

    const removeServingType = (type: string) => {
        setServingTypes(prev => prev.filter(x => x !== type));
        setServingTypePrices(prev => {
            const next = { ...prev };
            delete next[type];
            return next;
        });
    };
    
    const addFoodCategory = () => {
        const val = (foodCategoryCustom.trim() || foodCategory).trim();
        if (!val) return;
        if (!foodCategories.includes(val)) {
            setFoodCategories(prev => [...prev, val]);
        }
        setFoodCategoryCustom('');
        setFoodCategory('');
    };
    
    const addDietaryLabel = () => {
        const val = (dietaryLabelCustom.trim() || dietaryLabel).trim();
        if (!val) return;
        if (!dietaryLabels.includes(val)) {
            setDietaryLabels(prev => [...prev, val]);
        }
        setDietaryLabelCustom('');
        setDietaryLabel('');
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        setError(null);

        // Basic validation
        if (!productName.trim()) return setError('Food name is required.');
        if (!description.trim()) return setError('Description is required.');
        if (!status) return setError('Product status is required.');
        if (!timeAvailability) return setError('Time-based availability is required.');
        if (servingTypes.length === 0) return setError('At least one serving type is required.');
        if (foodCategories.length === 0) return setError('At least one food category is required.');
        if (!isEditMode && uploadedImages.length === 0) return setError('At least one image is required.');
        if (isEditMode && existingImages.length === 0 && uploadedImages.length === 0) return setError('At least one image is required.');
        if (isEditMode && uploadedImages.length > 0) return setError('Image updates are not supported for food edits yet.');
        if (uploadedImages.some(img => img.isUploading)) return setError('Please wait for images to finish uploading.');

        // Type-specific validation
        if (productType === 'simple' && portions.length === 0) return setError('Add at least one portion size.');
        if (productType === 'customizable' && savedGroups.length === 0) return setError('Add at least one customization group.');
        if (productType === 'customizable' && servingTypes.some(type => !servingTypePrices[type] || parseFloat(servingTypePrices[type]) <= 0)) {
            return setError('Add a valid base price for each serving type.');
        }
        if (productType === 'bundle' && bundleSlots.length === 0) return setError('Add at least one bundle slot.');

        setIsLoading(true);

        try {
            if (isEditMode) {
                const payload = buildUpdatePayload();
                const response = await fetch('/api/products/food', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (!response.ok) {
                    setError(result.message || 'Failed to update food item. Please try again.');
                    return;
                }

                onFoodUpdated?.();
                resetForm();
                onClose();
                return;
            }

            const formData = new FormData();

            // Scalar fields
            formData.append('name', productName);
            formData.append('type', productType === 'simple' ? 'Simple' : productType === 'customizable' ? 'Customizable' : 'Bundle');
            formData.append('description', description);
            formData.append('status', status);
            formData.append('availability', timeAvailability);

            // Array fields — API expects JSON strings
            formData.append('category', JSON.stringify(foodCategories));
            formData.append('labels', JSON.stringify(dietaryLabels));
            formData.append('servingType', JSON.stringify(servingTypes));

            // Type-specific payload
            if (productType === 'simple') {
                const portionPayload = portions.map(p => ({
                    name: p.name,
                    price: parseFloat(p.price) || 0,
                    startPrepTime: parseInt(p.prepTimeStart) || 0,
                    endPrepTime: parseInt(p.prepTimeEnd) || 0,
                    servingType: p.servingUnit,
                    servingPerServingType: parseInt(p.servings) || 0,
                }));
                formData.append('portion', JSON.stringify(portionPayload));
            }

            if (productType === 'customizable') {
                const servingTypePricingPayload = servingTypes.map(type => ({
                    servingType: type,
                    price: parseFloat(servingTypePrices[type]) || 0,
                }));
                const addOnPayload = savedGroups.map(g => ({
                    name: g.groupName,
                    selection: g.selection,
                    maxSelection: g.maxSelections,
                    isRequired: g.isRequired,
                    options: g.options.map(o => ({
                        name: o.name,
                        price: parseFloat(o.price) || 0,
                    })),
                }));
                formData.append('addOnGroup', JSON.stringify(addOnPayload));
                formData.append('servingTypePricing', JSON.stringify(servingTypePricingPayload));
            }

            if (productType === 'bundle') {
                const bundlePayload = bundleSlots.map(s => ({
                    name: s.name,
                    price: parseFloat(s.price) || 0,
                    category: s.category,
                    maxCount: s.maxItems,
                }));
                
                // Build addOnGroup from bundleAddOnGroups
                const addOnPayload = bundleAddOnGroups.map(g => ({
                    name: g.groupName,
                    selection: g.selection,
                    maxSelection: g.maxSelections,
                    isRequired: g.isRequired,
                    options: g.options.map(o => ({
                        name: o.name,
                        price: parseFloat(o.price) || 0,
                    })),
                }));
                
                formData.append('addOnGroup', JSON.stringify(addOnPayload));
                formData.append('bundleConfig', JSON.stringify(bundlePayload));
            }

            // Images
            uploadedImages.forEach(img => {
                formData.append('files', img.file);
            });

            const response = await fetch('/api/products/food', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || 'Failed to add food item. Please try again.');
                return;
            }

            onFoodAdded?.();
            resetForm();
            onClose();

        } catch (err) {
            console.error('Submit error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Reset ─────────────────────────────────────────────────────────────────

    const resetForm = () => {
        setUploadedImages([]);
        setExistingImages([]);
        setProductType('simple');
        setProductName('');
        setDescription('');
        setStatus('');
        setTimeAvailability('');
        setServingType('');
        setServingTypeCustom('');
        setServingTypes([]);
        setServingTypePrices({});
        setFoodCategory('');
        setFoodCategoryCustom('');
        setFoodCategories([]);
        setDietaryLabel('');
        setDietaryLabelCustom('');
        setDietaryLabels([]);
        setPortions([]);
        setSavedGroups([]);
        setBundleSlots([]);
        setBundleAddOnGroups([]); 
        setError(null);
    };

    const buildUpdatePayload = () => ({
        uid: editFoodItem?.uid,
        type: productType === 'simple' ? 'Simple' : productType === 'customizable' ? 'Customizable' : 'Bundle',
        name: productName,
        description,
        status,
        availability: timeAvailability,
        category: foodCategories,
        labels: dietaryLabels,
        servingType: servingTypes,
        ...(productType === 'customizable' && {
            servingTypePricing: servingTypes.map(type => ({
                servingType: type,
                price: parseFloat(servingTypePrices[type]) || 0,
            })),
        }),
        ...(productType === 'simple' && {
            portion: portions.map(p => ({
                ...(isPersistedId(p.id) && { uid: p.id }),
                productUid: editFoodItem?.uid,
                name: p.name,
                price: parseFloat(p.price) || 0,
                startPrepTime: parseInt(p.prepTimeStart) || 0,
                endPrepTime: parseInt(p.prepTimeEnd) || 0,
                servingType: p.servingUnit,
                servingPerServingType: parseInt(p.servings) || 0,
            })),
        }),
        ...(productType === 'customizable' && {
            addOnGroup: savedGroups.map(group => mapFormAddOnGroupToApi(group, editFoodItem?.uid)),
        }),
        ...(productType === 'bundle' && {
            addOnGroup: bundleAddOnGroups.map(group => mapFormBundleAddOnGroupToApi(group, editFoodItem?.uid)),
            bundleConfig: bundleSlots.map(s => ({
                ...(isPersistedId(s.id) && { uid: s.id }),
                productUid: editFoodItem?.uid,
                name: s.name,
                price: parseFloat(s.price) || 0,
                category: s.category,
                maxCount: s.maxItems,
                isRequired: s.isRequired,
            })),
        }),
    });

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
                            <h2 className="text-sm font-semibold">{isEditMode ? 'Edit Food Item' : 'Add Food Item'}</h2>
                            <p className='text-xs font-light text-[#A0A0A0]'>
                                {isEditMode ? 'Update the details for this food item.' : 'Fill in the details to create a new food item for your restaurant.'}
                            </p>
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
                                        <SelectItem value='Available Today'>Available Today</SelectItem>
                                        <SelectItem value='Out of Stock'>Out of Stock</SelectItem>
                                        <SelectItem value='Seasonal'>Seasonal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Time-based Availability<span className="text-destructive">*</span>
                                </Label>
                                <Select value={timeAvailability} onValueChange={setTimeAvailability} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select availability" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Breakfast'>Breakfast only</SelectItem>
                                        <SelectItem value='Lunch'>Lunch</SelectItem>
                                        <SelectItem value='Dinner'>Dinner</SelectItem>
                                        <SelectItem value='All Day'>All Day</SelectItem>
                                        <SelectItem value='Custom'>Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Serving Type<span className="text-destructive">*</span>
                                </Label>
                                <Select value={servingType} onValueChange={setServingType} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select serving type" />
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
                                    <Input
                                        value={servingTypeCustom}
                                        onChange={(e) => setServingTypeCustom(e.target.value)}
                                        placeholder="or type a custom serving type"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        size={'sm'}
                                        className='bg-white text-black border hover:bg-black hover:text-white'
                                        onClick={addServingType}
                                        disabled={isLoading}
                                    >
                                        <CircleCheck /> Add
                                    </Button>
                                </div>
                                {servingTypes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {servingTypes.map(t => (
                                            <span key={t} className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                                                {t}
                                                <button type="button" onClick={() => removeServingType(t)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {productType === 'customizable' && servingTypes.length > 0 && (
                                    <div className="mt-3 rounded-lg border border-dashed border-primary p-3 space-y-3">
                                        <div>
                                            <h4 className="text-xs font-semibold">Serving Type Base Prices</h4>
                                            <p className="text-[11px] text-muted-foreground">
                                                Set the actual food price for each serving type. Add-ons remain extra charges.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {servingTypes.map((type) => (
                                                <div key={type}>
                                                    <Label className="text-xs font-light mb-1 capitalize">
                                                        {type} price<span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="flex items-center border rounded-md bg-background overflow-hidden">
                                                        <span className="px-3 py-2 text-sm text-muted-foreground border-r">₦</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            step="0.01"
                                                            value={servingTypePrices[type] || ''}
                                                            onChange={(e) => setServingTypePrices(prev => ({ ...prev, [type]: e.target.value }))}
                                                            placeholder="0.00"
                                                            className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent"
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Food Category<span className="text-destructive">*</span>
                                </Label>
                                <Select value={foodCategory} onValueChange={setFoodCategory} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Rice Dishes'>Rice Dishes</SelectItem>
                                        <SelectItem value='Snacks'>Snacks</SelectItem>
                                        <SelectItem value='Drinks'>Drinks</SelectItem>
                                        <SelectItem value='Desserts'>Desserts</SelectItem>
                                        <SelectItem value='custom'>Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className='flex items-center gap-2 mt-2'>
                                    <Input
                                        value={foodCategoryCustom}
                                        onChange={(e) => setFoodCategoryCustom(e.target.value)}
                                        placeholder="or type a custom category"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        size={'sm'}
                                        className='bg-white text-black border hover:bg-black hover:text-white'
                                        onClick={addFoodCategory}
                                        disabled={isLoading}
                                    >
                                        <CircleCheck /> Add
                                    </Button>
                                </div>
                                {foodCategories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {foodCategories.map(c => (
                                            <span key={c} className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                                                {c}
                                                <button type="button" onClick={() => setFoodCategories(prev => prev.filter(x => x !== c))}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label className='text-xs font-light mt-4 mb-2'>
                                    Dietary Labels
                                </Label>
                                <Select value={dietaryLabel} onValueChange={setDietaryLabel} disabled={isLoading}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select dietary label" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Spicy'>Spicy</SelectItem>
                                        <SelectItem value='Vegetarian'>Vegetarian</SelectItem>
                                        <SelectItem value='Gluten-Free'>Gluten-Free</SelectItem>
                                        <SelectItem value='Contains Nuts'>Contains nuts</SelectItem>
                                        <SelectItem value='Halal'>Halal</SelectItem>
                                        <SelectItem value='Dairy-Free'>Dairy-free</SelectItem>
                                        <SelectItem value='custom'>Custom</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className='flex items-center gap-2 mt-2'>
                                    <Input
                                        value={dietaryLabelCustom}
                                        onChange={(e) => setDietaryLabelCustom(e.target.value)}
                                        placeholder="or type a custom label"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="button"
                                        size={'sm'}
                                        className='bg-white text-black border hover:bg-black hover:text-white'
                                        onClick={addDietaryLabel}
                                        disabled={isLoading}
                                    >
                                        <CircleCheck /> Add
                                    </Button>
                                </div>
                                {dietaryLabels.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {dietaryLabels.map(l => (
                                            <span key={l} className="flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                                                {l}
                                                <button type="button" onClick={() => setDietaryLabels(prev => prev.filter(x => x !== l))}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Type-specific sections — state lifted up via onChange props */}
                            {productType === 'simple' && (
                                <PortionSetup portions={portions} onChange={setPortions} />
                            )}
                            {productType === 'customizable' && (
                                <CustomizationOptions savedGroups={savedGroups} onChange={setSavedGroups} />
                            )}
                            {productType === 'bundle' && (
                                <BundleConfiguration slots={bundleSlots} onSlotsChange={setBundleSlots}    addOnGroups={bundleAddOnGroups}
                                onAddOnGroupsChange={setBundleAddOnGroups}/>
                            )}
                        </div>

                        {/* Right - Image Upload */}
                        <div className='w-full md:w-[50%]'>
                            <h2 className="text-sm font-semibold">Food Image</h2>
                            <p className="text-xs text-muted-foreground">Upload food images (max 5)</p>
                            <div className='border border-dashed border-primary rounded-lg w-full h-75 mt-4 flex flex-col items-center justify-center gap-3 py-3'>
                                <ImageIcon />
                                <Label
                                    htmlFor="picture"
                                    className={`flex items-center justify-center border rounded-lg p-2 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent'}`}
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

                            {existingImages.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs text-muted-foreground mb-2">Current images</p>
                                    <div className="flex flex-wrap gap-2">
                                        {existingImages.map((image) => (
                                            <div key={image} className="relative w-10 h-10">
                                                <div className="relative w-full h-full rounded border overflow-hidden">
                                                    <Image
                                                        src={image}
                                                        alt="Existing food"
                                                        fill
                                                        className="object-cover"
                                                        sizes="40px"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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

                    {error && (
                        <p className="text-xs text-destructive mt-3 text-right">{error}</p>
                    )}

                    <div className='flex justify-end gap-2 border-t mt-4 pt-4'>
                        <Button variant="outline" className="px-4 py-2 text-sm" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            className="px-4 py-2 text-sm"
                            onClick={handleSubmit}
                            disabled={isLoading || (!isEditMode && uploadedImages.length === 0)}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {isEditMode ? 'Updating Food Item...' : 'Adding Food Item...'}
                                </>
                            ) : (
                                isEditMode ? 'Update Food Item' : 'Add Food Item'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function mapFoodTypeToForm(type: string): 'simple' | 'customizable' | 'bundle' {
    const normalized = type.toLowerCase();
    if (normalized === 'customizable') return 'customizable';
    if (normalized === 'bundle') return 'bundle';
    return 'simple';
}

function mapApiServingTypePricesToForm(item: EditableFoodItem): Record<string, string> {
    const entries = item.servingTypePricing || item.servingTypePrices || [];
    const prices: Record<string, string> = {};

    for (const entry of entries) {
        const servingType = entry?.servingType || entry?.name || entry?.type;
        if (typeof servingType === 'string' && servingType.trim()) {
            prices[servingType] = String(entry?.price ?? '');
        }
    }

    return prices;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiPortionToForm(portion: any): PortionSize {
    return {
        id: portion.uid || portion.id || Math.random().toString(36).substr(2, 9),
        name: portion.name || '',
        price: String(portion.price ?? ''),
        prepTimeStart: String(portion.startPrepTime ?? portion.prepTimeStart ?? ''),
        prepTimeEnd: String(portion.endPrepTime ?? portion.prepTimeEnd ?? ''),
        servings: String(portion.servingPerServingType ?? portion.servings ?? ''),
        servingUnit: portion.servingType || portion.servingUnit || 'plate',
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiAddOnGroupToForm(group: any): SavedGroup {
    return {
        id: group.uid || group.id || Math.random().toString(36).substr(2, 9),
        groupName: group.name || group.groupName || '',
        selection: group.selection === 'multiple' ? 'multiple' : 'single',
        maxSelections: group.maxSelection || group.maxSelections || 1,
        isRequired: !!group.isRequired,
        options: (group.options || []).map((option: ApiAddOnOption) => ({
            id: option.uid || option.id || Math.random().toString(36).substr(2, 9),
            name: option.name || '',
            price: String(option.price ?? ''),
        })),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiBundleAddOnGroupToForm(group: any): BundleAddOnGroup {
    return {
        ...mapApiAddOnGroupToForm(group),
        draftOptionName: '',
        draftOptionPrice: '',
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiBundleSlotToForm(slot: any): BundleSlot {
    return {
        id: slot.uid || slot.id || Math.random().toString(36).substr(2, 9),
        name: slot.name || '',
        price: String(slot.price ?? ''),
        category: slot.category || '',
        maxItems: slot.maxCount || slot.maxItems || 1,
        isRequired: !!slot.isRequired,
    };
}

function isPersistedId(id: string) {
    return id.includes('-') || id.length > 12;
}

function mapFormAddOnGroupToApi(group: SavedGroup, productUid?: string) {
    return {
        ...(isPersistedId(group.id) && { uid: group.id }),
        productUid,
        name: group.groupName,
        selection: group.selection,
        maxSelection: group.maxSelections,
        isRequired: group.isRequired,
        options: group.options.map(option => ({
            ...(isPersistedId(option.id) && { uid: option.id }),
            ...(isPersistedId(group.id) && { addOnGroupUid: group.id }),
            name: option.name,
            price: parseFloat(option.price) || 0,
        })),
    };
}

function mapFormBundleAddOnGroupToApi(group: BundleAddOnGroup, productUid?: string) {
    return mapFormAddOnGroupToApi(group, productUid);
}
