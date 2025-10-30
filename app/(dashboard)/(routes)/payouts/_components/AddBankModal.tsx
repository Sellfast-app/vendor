"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BankData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface AddBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBank: (bankData: BankData) => void;
}

// List of Nigerian banks
const nigerianBanks = [
  { id: 'access', name: 'Access Bank' },
  { id: 'gtb', name: 'GTBank' },
  { id: 'zenith', name: 'Zenith Bank' },
  { id: 'uba', name: 'UBA' },
  { id: 'first-bank', name: 'First Bank' },
  { id: 'fidelity', name: 'Fidelity Bank' },
  { id: 'sterling', name: 'Sterling Bank' },
  { id: 'union', name: 'Union Bank' },
  { id: 'wema', name: 'Wema Bank' },
  { id: 'unity', name: 'Unity Bank' },
  { id: 'polaris', name: 'Polaris Bank' },
  { id: 'stanbic', name: 'Stanbic IBTC' },
  { id: 'eco', name: 'Ecobank' },
  { id: 'fcmb', name: 'FCMB' },
  { id: 'keystone', name: 'Keystone Bank' },
];

export default function AddBankModal({ 
  isOpen, 
  onClose, 
  onAddBank 
}: AddBankModalProps) {
  const [formData, setFormData] = useState<BankData>({
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });

  const [errors, setErrors] = useState<Partial<BankData>>({});

  const handleInputChange = (field: keyof BankData, value: string) => {
    let formattedValue = value;

    // Only allow numbers for account number and limit to 10 digits
    if (field === 'accountNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankData> = {};

    if (!formData.bankName) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.length !== 10) {
      newErrors.accountNumber = 'Account number must be 10 digits';
    }

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Account holder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddBank(formData);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolder: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add Bank</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Specify the details about this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Bank Name Selector */}
          <div className="space-y-2">
            <Label htmlFor="bankName" className="text-xs">
              Bank Name <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.bankName} 
              onValueChange={(value) => handleInputChange('bankName', value)}
            >
              <SelectTrigger className={`w-full ${errors.bankName ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent>
                {nigerianBanks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bankName && (
              <p className="text-xs text-red-500">{errors.bankName}</p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-xs">
              Account Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="e.g. johndoe@example.com"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              className={errors.accountNumber ? 'border-red-500' : ''}
            />
            {errors.accountNumber && (
              <p className="text-xs text-red-500">{errors.accountNumber}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Verify
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}