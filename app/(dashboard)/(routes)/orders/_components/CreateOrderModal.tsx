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
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

interface Order {
    orderId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerAddress: string;
    productName: string;
    price: number;
    discount: number;
    quantity: number;
    payment: string;
    deliveryNote: string;
    deliveryPartner: string;
    autoSelect: boolean;
}

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateOrder: (order: Order) => void;
    order?: Order | null;
    isEditMode?: boolean;
}

export default function CreateOrderModal({ 
    isOpen, 
    onClose, 
    onCreateOrder, 
    order, 
    isEditMode = false 
}: CreateOrderModalProps) {
    const [localOrder, setLocalOrder] = useState<Order>({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        customerAddress: "",
        productName: "",
        price: 0,
        discount: 0,
        quantity: 1,
        payment: "Cash",
        deliveryNote: "",
        deliveryPartner: "",
        autoSelect: true,
    });

    useEffect(() => {
        if (order && isEditMode) {
            setLocalOrder(order);
        } else {
            // Reset form when opening in create mode
            setLocalOrder({
                customerName: "",
                customerPhone: "",
                customerEmail: "",
                customerAddress: "",
                productName: "",
                price: 0,
                discount: 0,
                quantity: 1,
                payment: "Cash",
                deliveryNote: "",
                deliveryPartner: "",
                autoSelect: true,
            });
        }
    }, [order, isEditMode, isOpen]);

    const handleInputChange = (field: keyof Order, value: string | number | boolean) => {
        setLocalOrder(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onCreateOrder(localOrder);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] border-none rounded-lg p-6 bg-card overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {isEditMode ? "Edit Order" : "Create Order"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {isEditMode ? "Update the order details" : "Specify the details about this order"}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* Left Column - Customer Details */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="customerName" className="text-xs mb-1">
                                Customer Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="customerName"
                                placeholder="e.g. John Doe"
                                value={localOrder.customerName}
                                onChange={(e) => handleInputChange('customerName', e.target.value)}
                                className="bg-background"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="customerPhone" className="text-xs mb-1">
                                    Customer Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex gap-1">
                                    <Select defaultValue="+234">
                                        <SelectTrigger className="w-20 bg-background">
                                            <SelectValue placeholder="+234" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="+234">+234</SelectItem>
                                            <SelectItem value="+1">+1</SelectItem>
                                            <SelectItem value="+44">+44</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        id="customerPhone"
                                        placeholder="123 456 7890"
                                        value={localOrder.customerPhone}
                                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                                        className="bg-background flex-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="customerEmail" className="text-xs mb-1">
                                    Customer Email <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="customerEmail"
                                    type="email"
                                    placeholder="e.g. johndoe@example.com"
                                    value={localOrder.customerEmail}
                                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                    className="bg-background"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="customerAddress" className="text-xs mb-1">
                                Customer Address <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="customerAddress"
                                placeholder="e.g. 123 John's Street"
                                value={localOrder.customerAddress}
                                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                                className="bg-background min-h-[80px] resize-none"
                            />
                        </div>

                        <div>
                            <Label htmlFor="payment" className="text-xs mb-1">
                                Payment <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={localOrder.payment} 
                                onValueChange={(value) => handleInputChange('payment', value)}
                            >
                                <SelectTrigger className="w-full bg-background">
                                    <SelectValue placeholder="Cash" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Card">Card</SelectItem>
                                    <SelectItem value="Transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="deliveryNote" className="text-xs mb-1">
                                Delivery Note
                            </Label>
                            <Textarea
                                id="deliveryNote"
                                placeholder="Tell us about your product..."
                                value={localOrder.deliveryNote}
                                onChange={(e) => handleInputChange('deliveryNote', e.target.value)}
                                className="bg-background min-h-[100px] resize-none"
                            />
                        </div>
                    </div>

                    {/* Right Column - Product Details */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="productName" className="text-xs mb-1">
                                Products <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="productName"
                                    placeholder="Enter product name..."
                                    value={localOrder.productName}
                                    onChange={(e) => handleInputChange('productName', e.target.value)}
                                    className="bg-background pr-10"
                                />
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="price" className="text-xs mb-1">
                                    Price
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                                        ₦
                                    </span>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0.00"
                                        value={localOrder.price || ""}
                                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                        className="bg-background pl-8"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="discount" className="text-xs mb-1">
                                    Discount
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="discount"
                                        type="number"
                                        placeholder="0"
                                        value={localOrder.discount || ""}
                                        onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                                        className="bg-background pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                                        %
                                    </span>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="quantity" className="text-xs mb-1">
                                    Quantity
                                </Label>
                                <Select 
                                    value={localOrder.quantity.toString()} 
                                    onValueChange={(value) => handleInputChange('quantity', parseInt(value))}
                                >
                                    <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder="0" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <SelectItem key={num} value={num.toString()}>
                                                {num}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="delivery" className="text-xs">
                                    Delivery <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Auto-select</span>
                                    <div
                                        className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${
                                            localOrder.autoSelect ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                        onClick={() => handleInputChange('autoSelect', !localOrder.autoSelect)}
                                    >
                                        <div
                                            className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                                                localOrder.autoSelect ? 'translate-x-5' : 'translate-x-0.5'
                                            } mt-0.5`}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Select 
                                value={localOrder.deliveryPartner} 
                                onValueChange={(value) => handleInputChange('deliveryPartner', value)}
                                disabled={localOrder.autoSelect}
                            >
                                <SelectTrigger className={`w-full ${localOrder.autoSelect ? 'bg-muted' : 'bg-background'}`}>
                                    <SelectValue placeholder="Select delivery partner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Kwik">Kwik</SelectItem>
                                    <SelectItem value="GIG">GIG</SelectItem>
                                    <SelectItem value="Sendnow">Sendnow</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4 mt-6">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleSubmit}
                        className="bg-green-500 hover:bg-green-600 text-white"
                    >
                        {isEditMode ? "Update" : "Create"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}