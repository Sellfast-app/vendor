"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, ArrowLeft, Trash2, Copy, Clock, PlusIcon } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import EditIcon from "@/components/svgIcons/Edit";
import SaveIcon from "@/components/svgIcons/SaveIcon";
import { Switch } from "@/components/ui/switch";
import QrIcon from "@/components/svgIcons/QrIcon";
import LinkIcon from "@/components/svgIcons/LinkIcon";
import { RiShare2Fill } from 'react-icons/ri';
import ThemeIcon from "@/components/svgIcons/ThemeIcon";
import AddBankModal from "../../../payouts/_components/AddBankModal";
import Accessbank from "@/components/svgIcons/Accessbank";

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  icon: React.ReactNode;
}

const mockStores = [
    {
        id: "1",
        name: "Cassie's Kitchen",
        type: "Bakery",
        location: "Lagos",
        status: "Active",
        whatsappNumber: "+234 809 123 4567",
        bio: "A cozy bakery serving fresh pastries.",
        image: "/placeholder-store1.jpg",
        customUrl: "www.swiftree.com/cassies/kitchen",
    },
    {
        id: "2",
        name: "Burger Shack",
        type: "Restaurant",
        location: "Lagos",
        status: "Inactive",
        whatsappNumber: "+234 809 234 5678",
        bio: "Serving delicious burgers and fries.",
        image: "/placeholder-store2.jpg",
        customUrl: "www.swiftree.com/burger/shack",
    },
    {
        id: "3",
        name: "Pizza Cafe",
        type: "Bakery",
        location: "Lagos",
        status: "Inactive",
        whatsappNumber: "+234 809 345 6789",
        bio: "Your go-to spot for authentic pizza.",
        image: "/placeholder-store3.jpg",
        customUrl: "www.swiftree.com/pizza/cafe",
    },
];

const businessTypes = [
    "Restaurant/Food Service",
    "Food & Restaurant",
    "Retail Store",
    "Bakery",
    "E-commerce",
    "Professional Services",
    "Health & Beauty",
    "Technology",
    "Education",
    "Real Estate",
    "Other",
];

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const themes = [
    { name: "Beige Green", value: "beige-green" },
    { name: "Ocean Blue", value: "ocean-blue" },
    { name: "Sunset Orange", value: "sunset-orange" },
    { name: "Royal Purple", value: "royal-purple" },
];

export default function StoreDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const storeId = params.id as string;

    const store = mockStores.find((s) => s.id === storeId);

    const [isEditingStorefront, setIsEditingStorefront] = useState(false);
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);
    const [showDeleteSection, setShowDeleteSection] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: store?.name || "",
        type: store?.type || "",
        whatsappNumber: store?.whatsappNumber || "",
        countryCode: "+234",
        bio: store?.bio || "",
        customUrl: store?.customUrl || "",
    });

    const [availability, setAvailability] = useState(
        daysOfWeek.map((day) => ({
            day,
            isOpen: true,
            openTime: "00:00",
            closeTime: "00:00",
        }))
    );

    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
        {
          id: "1",
          accountNumber: "0102798098",
          bankName: "Access Bank",
          accountHolder: "Olasandra Kayla .A.",
          icon: <Accessbank />,
        },
        {
          id: "2",
          accountNumber: "9027895098",
          bankName: "Unity",
          accountHolder: "Olasandra Kayla .A.",
          icon: <Accessbank />,
        },
        {
          id: "3",
          accountNumber: "2025092169",
          bankName: "Kuda Bank",
          accountHolder: "Olasandra Kayla .A.",
          icon: <Accessbank />,
        },
    ]);

    const [selectedTheme, setSelectedTheme] = useState("beige-green");

    if (!store) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Store Not Found</h2>
                    <p className="text-muted-foreground mb-4">
                        The store you&apos;re looking for doesn&apos;t exist.
                    </p>
                    <Button onClick={() => router.push("/settings")}>
                        Back to Settings
                    </Button>
                </div>
            </div>
        );
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveStorefront = () => {
        setIsEditingStorefront(false);
        console.log("Saving storefront data:", formData);
    };

    const handleCancelStorefront = () => {
        setIsEditingStorefront(false);
        setFormData({
            name: store?.name || "",
            type: store?.type || "",
            whatsappNumber: store?.whatsappNumber || "",
            countryCode: "+234",
            bio: store?.bio || "",
            customUrl: store?.customUrl || "",
        });
    };

    const handleSaveAvailability = () => {
        setIsEditingAvailability(false);
        console.log("Saving availability:", availability);
    };

    const handleCancelAvailability = () => {
        setIsEditingAvailability(false);
    };

    const handleAvailabilityChange = (
        index: number,
        field: string,
        value: string | boolean
    ) => {
        const newAvailability = [...availability];
        newAvailability[index] = { ...newAvailability[index], [field]: value };
        setAvailability(newAvailability);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(formData.customUrl);
    };

    const handleAddBank = (bankData: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    }) => {
        // Generate bank icon based on bank name
        const getBankIcon = (bankName: string) => {
            if (bankName === 'Access Bank') {
                return <Accessbank />;
            }
            // For other banks, use colored circles with abbreviations
            const colors: { [key: string]: string } = {
                'GTBank': 'bg-orange-500',
                'Zenith Bank': 'bg-red-600',
                'UBA': 'bg-red-700',
                'First Bank': 'bg-blue-800',
                'Fidelity Bank': 'bg-purple-600',
                'Sterling Bank': 'bg-blue-700',
                'Union Bank': 'bg-blue-600',
                'Wema Bank': 'bg-purple-700',
                'Unity Bank': 'bg-green-600',
                'Polaris Bank': 'bg-indigo-600',
                'Stanbic IBTC': 'bg-blue-500',
                'Ecobank': 'bg-red-500',
                'FCMB': 'bg-yellow-600',
                'Keystone Bank': 'bg-teal-600',
            };

            const abbreviation = bankName.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase();
            const color = colors[bankName] || 'bg-gray-500';

            return (
                <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {abbreviation}
                </div>
            );
        };

        const newBank: BankAccount = {
            id: `bank-${bankAccounts.length + 1}`,
            icon: getBankIcon(bankData.bankName),
            accountNumber: bankData.accountNumber,
            bankName: bankData.bankName,
            accountHolder: bankData.accountHolder
        };

        setBankAccounts([...bankAccounts, newBank]);
        setIsAddBankModalOpen(false);
    };

    return (
        <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/settings")}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 rounded-md">
                            <AvatarImage src={store.image} alt={store.name} />
                            <AvatarFallback>{store.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-sm font-bold">{store.name}</h3>
                            <p className="text-xs text-muted-foreground">
                                Store Setup • {store.type} • {store.location}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <RiShare2Fill />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <QrIcon />
                        View QR Banner
                    </Button>
                    <Button size="sm">Visit Storefront <LinkIcon /></Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Storefront Setup */}
                <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
                    <CardContent>
                        <div className="space-y-6 pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Storefront Setup</h3>
                                {!isEditingStorefront ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingStorefront(true)}
                                    >
                                        <span className="hidden sm:inline mr-2">Edit</span>
                                        <EditIcon />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelStorefront}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleSaveStorefront}
                                        >
                                            <SaveIcon />
                                            <span className="hidden sm:inline ml-2">Save Changes</span>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Store Image */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative">
                                    <Avatar className="w-24 h-24 rounded-md">
                                        <AvatarImage src={store.image} alt={store.name} />
                                        <AvatarFallback>{store.name[0]}</AvatarFallback>
                                    </Avatar>
                                    {isEditingStorefront && (
                                        <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName" className="text-xs">
                                        Store Name *
                                    </Label>
                                    <Input
                                        id="storeName"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        disabled={!isEditingStorefront}
                                        className="dark:bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="whatsappNumber" className="text-xs">
                                        WhatsApp Business Number *
                                    </Label>
                                    <div className="flex gap-1">
                                        <Select
                                            value={formData.countryCode}
                                            onValueChange={(value) =>
                                                handleInputChange("countryCode", value)
                                            }
                                            disabled={!isEditingStorefront}
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
                                            value={formData.whatsappNumber
                                                .replace(formData.countryCode, "")
                                                .trim()}
                                            onChange={(e) =>
                                                handleInputChange("whatsappNumber", e.target.value)
                                            }
                                            disabled={!isEditingStorefront}
                                            className="flex-1 dark:bg-background"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="storeType" className="text-xs">
                                        Store Type *
                                    </Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => handleInputChange("type", value)}
                                        disabled={!isEditingStorefront}
                                    >
                                        <SelectTrigger className="w-full dark:bg-background">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {businessTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-xs">
                                        Location *
                                    </Label>
                                    <Select disabled={!isEditingStorefront}>
                                        <SelectTrigger className="w-full dark:bg-background">
                                            <SelectValue placeholder="Lagos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lagos">Lagos</SelectItem>
                                            <SelectItem value="abuja">Abuja</SelectItem>
                                            <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2 relative">
                                    <Label htmlFor="bio" className="text-xs">
                                        Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={(e) => handleInputChange("bio", e.target.value)}
                                        maxLength={500}
                                        disabled={!isEditingStorefront}
                                        className="dark:bg-background resize-none text-xs min-h-[80px]"
                                        placeholder="Write a bio for your store..."
                                    />
                                    <p className="text-xs text-right text-muted-foreground">
                                        {formData.bio.length}/500
                                    </p>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="customUrl" className="text-xs">
                                        Custom Storefront URL
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="customUrl"
                                            value={formData.customUrl}
                                            disabled
                                            className="dark:bg-background pr-24"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 -translate-y-1/2"
                                            onClick={copyToClipboard}
                                        >
                                            <Copy className="w-4 h-4 mr-1" />
                                            <span className="text-xs">Copy Link</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Availability Setup */}
                <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
                    <CardContent>
                        <div className="space-y-6 pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Availability Setup</h3>
                                {!isEditingAvailability ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingAvailability(true)}
                                    >
                                        <span className="hidden sm:inline mr-2">Edit</span>
                                        <EditIcon />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelAvailability}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleSaveAvailability}
                                        >
                                            <SaveIcon />
                                            <span className="hidden sm:inline ml-2">Save Changes</span>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {availability.map((item, index) => (
                                    <div
                                        key={item.day}
                                        className="flex items-center justify-between gap-4 p-3 border rounded-lg"
                                    >
                                        <span className="text-sm font-medium w-24">{item.day}</span>
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">AM</span>
                                                <Input
                                                    type="time"
                                                    value={item.openTime}
                                                    onChange={(e) =>
                                                        handleAvailabilityChange(
                                                            index,
                                                            "openTime",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={!isEditingAvailability || !item.isOpen}
                                                    className="w-24 h-8 text-xs dark:bg-background"
                                                />
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <span className="text-xs text-muted-foreground">-</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">PM</span>
                                                <Input
                                                    type="time"
                                                    value={item.closeTime}
                                                    onChange={(e) =>
                                                        handleAvailabilityChange(
                                                            index,
                                                            "closeTime",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={!isEditingAvailability || !item.isOpen}
                                                    className="w-24 h-8 text-xs dark:bg-background"
                                                />
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <Switch
                                            checked={item.isOpen}
                                            onCheckedChange={(checked) =>
                                                handleAvailabilityChange(index, "isOpen", checked)
                                            }
                                            disabled={!isEditingAvailability}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Bank Account Setup */}
                <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
                    <CardContent>
                        <div className="space-y-6 pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Bank Account Setup</h3>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsAddBankModalOpen(true)}
                                >
                                    <span className="hidden sm:inline">Add Bank Account</span>  
                                    <PlusIcon className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {bankAccounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center justify-between p-4 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                {account.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-sm">{account.accountNumber}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {account.bankName} • {account.accountHolder}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Theme & Customization */}
                <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
                    <CardContent>
                        <div className="space-y-6 pt-6">
                            <h3 className="text-sm font-medium">Theme & Customization</h3>

                            <div className="space-y-2 flex justify-between">
                                <Label className="text-sm">  <ThemeIcon /> Theme</Label>
                                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                                    <SelectTrigger className=" dark:bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {themes.map((theme) => (
                                            <SelectItem key={theme.value} value={theme.value}>
                                                {theme.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
                    <CardContent>
                        <div className="space-y-4 pt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                                    <p className="text-xs text-muted-foreground">
                                        After making a deletion request, you will have{" "}
                                        <span className="font-semibold">&quot;9 months&quot;</span> to
                                        maintain this account.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeleteSection(!showDeleteSection)}
                                > <Trash2 className="w-4 h-4 mr-2" />  Delete Store </Button>
                            </div>

                            {showDeleteSection && (
                                <div className="space-y-4 pt-4">
                                    <div className="bg-[#FFEFEF] border border-[#E40101] rounded-lg p-4">
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                                            <p className="text-sm">
                                                To permanently erase your store, click the button below. This
                                                implies that you won&apos;t have access to orders and any
                                                information related to this store. This action is irreversible.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deleteConfirm" className="text-sm text-center block">
                                            To delete account, enter{" "}
                                            <span className="font-semibold">
                                                &quot;delete_pizza_cafe&quot;
                                            </span>
                                        </Label>
                                        <Input
                                            id="deleteConfirm"
                                            placeholder="Enter here..."
                                            value={deleteConfirmText}
                                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                                            className="dark:bg-background"
                                        />
                                    </div>

                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowDeleteSection(false);
                                                setDeleteConfirmText("");
                                            }}
                                        > Cancel  </Button>
                                        <Button
                                            variant="destructive" 
                                            size="sm"
                                            disabled={deleteConfirmText !== "delete_pizza_cafe"}
                                        > <Trash2 className="w-4 h-4 mr-2" />  Delete Store  </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <AddBankModal
                isOpen={isAddBankModalOpen}
                onClose={() => setIsAddBankModalOpen(false)}
                onAddBank={handleAddBank}
            />
        </div>
    );
}