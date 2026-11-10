"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface BankData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankCode: string;
  nameEnquiryBankCode?: string;
}

interface Bank {
  code: string;
  name: string;
  nameEnquiryBankCode?: string;
}

interface AddBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBank: (bankData: BankData) => void;
  provider?: 'paystack' | 'seerbit';
}

export default function AddBankModal({ 
  isOpen, 
  onClose, 
  onAddBank,
  provider = 'paystack',
}: AddBankModalProps) {
  const [formData, setFormData] = useState<BankData>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    bankCode: '',
    nameEnquiryBankCode: '',
  });

  const [banks, setBanks] = useState<Bank[]>([]);
  const [errors, setErrors] = useState<Partial<BankData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreatingSubaccount, setIsCreatingSubaccount] = useState(false);

  // Fetch banks on component mount
  useEffect(() => {
    if (isOpen) {
      fetchBanks();
    }
  }, [isOpen, provider]);

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(provider === 'seerbit'
        ? '/api/v2/payment-methods/seerbit/banks'
        : '/api/payments/banks?provider=paystack');
      const data = await response.json();

      if (data.status === 'success' && data.data) {
        setBanks(data.data.map((bank: Record<string, string>) => provider === 'seerbit'
          ? { code: bank.bank_code, name: bank.name, nameEnquiryBankCode: bank.name_enquiry_bank_code }
          : { code: bank.code, name: bank.name }));
      } else {
        toast.error(data.message || `Failed to load ${provider === 'seerbit' ? 'SeerBit' : 'Paystack'} banks`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to load ${provider === 'seerbit' ? 'SeerBit' : 'Paystack'} banks`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BankData, value: string) => {
    let formattedValue = value;

    // Only allow numbers for account number and limit to 10 digits
    if (field === 'accountNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, provider === 'seerbit' ? 20 : 10);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (field === 'accountNumber') {
      setFormData(prev => ({ ...prev, accountHolder: '' }));
    }
    
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBankSelect = (bankName: string) => {
    const selectedBank = banks.find(bank => bank.name === bankName);
    if (selectedBank) {
      setFormData(prev => ({
        ...prev,
        bankName,
        bankCode: selectedBank.code,
        nameEnquiryBankCode: selectedBank.nameEnquiryBankCode || '',
        accountHolder: '',
      }));
    }
  };

  const verifyAccount = async () => {
    if (!formData.bankCode || !formData.accountNumber) {
      setErrors({
        bankName: !formData.bankCode ? 'Please select a bank' : '',
        accountNumber: !formData.accountNumber ? 'Account number is required' : ''
      });
      return;
    }

    if (provider === 'paystack' && formData.accountNumber.length !== 10) {
      setErrors({
        accountNumber: 'Account number must be 10 digits'
      });
      return;
    }
    if (provider === 'seerbit' && (formData.accountNumber.length < 4 || !formData.nameEnquiryBankCode)) {
      setErrors({ accountNumber: 'Enter a valid account number and select a bank' });
      return;
    }

    try {
      setIsVerifying(true);
      const response = provider === 'seerbit'
        ? await fetch('/api/v2/payment-methods/seerbit/resolve-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name_enquiry_bank_code: formData.nameEnquiryBankCode, account_number: formData.accountNumber }),
          })
        : await fetch(`/api/payments/resolve-account?account_number=${formData.accountNumber}&bank_code=${formData.bankCode}&provider=paystack`);
      
      const data = await response.json();

      if (data.status === 'success' && data.data) {
        setFormData(prev => ({
          ...prev,
          accountHolder: data.data.account_name
        }));
        toast.success('Account verified successfully');
      } else {
        toast.error(data.message || 'Failed to verify account');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify account');
    } finally {
      setIsVerifying(false);
    }
  };

  // NEW: Create business subaccount function
  const createBusinessSubaccount = async (): Promise<boolean> => {
    try {
      // Extract store info from cookies
      const cookies = document.cookie.split(';');
      let storeId = '';
      let storeName = '';

      cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name === 'store_id') {
          storeId = decodeURIComponent(value);
        }
        if (name === 'store_name') {
          storeName = decodeURIComponent(value);
        }
      });

      if (provider === 'paystack' && (!storeId || !storeName)) {
        toast.error('Store information not found. Please login again.');
        return false;
      }

      const response = await fetch(provider === 'seerbit' ? '/api/v2/payment-methods/seerbit/sub-account' : '/api/payments/subaccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(provider === 'seerbit'
          ? {
              bank_code: formData.bankCode,
              name_enquiry_bank_code: formData.nameEnquiryBankCode,
              bank_name: formData.bankName,
              account_number: formData.accountNumber,
            }
          : {
              store_id: storeId,
              business_name: storeName,
              settlement_bank: formData.bankCode,
              account_number: formData.accountNumber,
            })
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success(provider === 'seerbit' ? 'SeerBit settlement account added' : 'Business subaccount created successfully');
        return true;
      } else {
        toast.error(data.message || 'Failed to create business subaccount');
        return false;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create settlement account');
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankData> = {};

    if (!formData.bankName) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (provider === 'paystack' && formData.accountNumber.length !== 10) {
      newErrors.accountNumber = 'Account number must be 10 digits';
    } else if (provider === 'seerbit' && (formData.accountNumber.length < 4 || !formData.nameEnquiryBankCode)) {
      newErrors.accountNumber = 'Enter a valid account number';
    }

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Please verify account number first';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // UPDATED: Handle submit with subaccount creation
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsCreatingSubaccount(true);
      
      // First create the business subaccount
      const subaccountCreated = await createBusinessSubaccount();
      
      if (subaccountCreated) {
        // Then add the bank to local state
        onAddBank(formData);
        handleCancel();
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to complete bank account setup');
    } finally {
      setIsCreatingSubaccount(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      bankCode: '',
      nameEnquiryBankCode: '',
    });
    setErrors({});
    onClose();
  };

  const canVerify = formData.bankCode && (provider === 'paystack'
    ? formData.accountNumber.length === 10
    : formData.accountNumber.length >= 4 && Boolean(formData.nameEnquiryBankCode));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Add {provider === 'seerbit' ? 'SeerBit' : 'Paystack'} Bank Account</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Verify the bank account that will receive your {provider === 'seerbit' ? 'SeerBit' : 'Paystack'} settlements
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
              onValueChange={handleBankSelect}
              disabled={isLoading}
            >
              <SelectTrigger className={`w-full ${errors.bankName ? 'border-red-500' : ''}`}>
                <SelectValue placeholder={isLoading ? "Loading banks..." : "Select Bank"} />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.name}>
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
            <div className="flex gap-2">
              <Input
                id="accountNumber"
                type="text"
                placeholder={provider === 'paystack' ? 'Enter 10-digit account number' : 'Enter account number'}
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                className={errors.accountNumber ? 'border-red-500' : ''}
                maxLength={provider === 'paystack' ? 10 : 20}
              />
              <Button
                type="button"
                onClick={verifyAccount}
                disabled={!canVerify || isVerifying}
                className="whitespace-nowrap"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
            {errors.accountNumber && (
              <p className="text-xs text-red-500">{errors.accountNumber}</p>
            )}
          </div>

          {/* Account Holder Name (Auto-filled after verification) */}
          <div className="space-y-2">
            <Label htmlFor="accountHolder" className="text-xs">
              Account Holder Name
            </Label>
            <Input
              id="accountHolder"
              type="text"
              placeholder="Will be auto-filled after verification"
              value={formData.accountHolder}
              readOnly
              className="bg-gray-50"
            />
            {errors.accountHolder && (
              <p className="text-xs text-red-500">{errors.accountHolder}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleCancel} disabled={isCreatingSubaccount}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!formData.accountHolder || isCreatingSubaccount}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isCreatingSubaccount ? 'Adding...' : 'Add Bank Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
