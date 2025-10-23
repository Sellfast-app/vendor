"use client";

import React, { useState, useEffect, JSX } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Trash2, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface CardData {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface CreditCard {
  id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: string;
  icon: JSX.Element;
}

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard?: (cardData: CardData) => void;
  onUpdateCard?: (cardId: string, cardData: CardData) => void;
  onDeleteCard?: (cardId: string) => void;
  editCard?: CreditCard | null;
  isEditMode?: boolean;
}

export default function AddCardModal({ 
  isOpen, 
  onClose, 
  onAddCard, 
  onUpdateCard,
  onDeleteCard,
  editCard,
  isEditMode = false 
}: AddCardModalProps) {
  const [formData, setFormData] = useState<CardData>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState<Partial<CardData>>({});
  const [showCardNumber, setShowCardNumber] = useState(false);

  useEffect(() => {
    if (isEditMode && editCard) {
      setFormData({
        cardholderName: editCard.cardHolder,
        cardNumber: editCard.cardNumber,
        expiryDate: editCard.expiryDate,
        cvv: '***' // Don't show actual CVV for security
      });
    } else {
      setFormData({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      });
    }
    setErrors({});
  }, [isEditMode, editCard, isOpen]);

  const handleInputChange = (field: keyof CardData, value: string) => {
    let formattedValue = value;

    // Format card number with spaces every 4 digits
    if (field === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19); // Max 16 digits + 3 spaces
    }

    // Format expiry date as MM/YY
    if (field === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
    }

    // Limit CVV to 3 digits
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CardData> = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberDigits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumberDigits.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, ] = formData.expiryDate.split('/');
      const monthNum = parseInt(month);
      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiryDate = 'Invalid month';
      }
    }

    if (!isEditMode || formData.cvv !== '***') {
      if (!formData.cvv) {
        newErrors.cvv = 'CVV is required';
      } else if (formData.cvv.length !== 3) {
        newErrors.cvv = 'CVV must be 3 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (isEditMode && editCard && onUpdateCard) {
        onUpdateCard(editCard.id, formData);
      } else if (onAddCard) {
        onAddCard(formData);
      }
      handleCancel();
    }
  };

  const handleDelete = () => {
    if (editCard && onDeleteCard) {
      onDeleteCard(editCard.id);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setFormData({
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    setErrors({});
    setShowCardNumber(false);
    onClose();
  };

  const formatCardNumberForDisplay = (cardNumber: string) => {
    if (showCardNumber) {
      return cardNumber;
    }
    return `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Card Details</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditMode ? 'Update your card information' : 'Specify the details about this order'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Card Preview - Only show in edit mode */}
          {isEditMode && editCard && (
            <div className="space-y-4 px-5">
              <div className="relative">
                <Image 
                  src={editCard.image} 
                  alt="Credit Card" 
                  className="w-full rounded-lg"
                />
                <div className='absolute top-3 left-4'>{editCard.icon}</div>
                <h4 className="absolute bottom-3 left-4 text-white text-sm">{formData.cardholderName || editCard.cardHolder}</h4>
                <span className='absolute bottom-3 left-1/2 transform -translate-x-1/2 text-white text-sm'>{formData.expiryDate || editCard.expiryDate}</span>
                <span className="absolute bottom-3 right-4 text-white text-sm">{editCard.cardType}</span>
                <div className="flex items-center gap-2 absolute left-4 top-1/2 transform -translate-y-1/2 text-white">
                  <span className="text-base">{formatCardNumberForDisplay(formData.cardNumber || editCard.cardNumber)}</span>
                  <button 
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="p-1"
                  >
                    {showCardNumber ? (
                      <Eye className="w-4 h-4 text-white" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Set as Default and Delete buttons */}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" className="text-sm">
                  Set as Default
                </Button>
                <Button 
                  variant="outline" 
                  className="text-sm text-red-500 hover:text-red-600"
                  onClick={handleDelete}
                >
                  Delete Card <Trash2 className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName" className="text-xs">
              Cardholder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cardholderName"
              placeholder="Cassandra Kayla Antoinette"
              value={formData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              className={errors.cardholderName ? 'border-red-500' : ''}
            />
            {errors.cardholderName && (
              <p className="text-xs text-red-500">{errors.cardholderName}</p>
            )}
          </div>

          {/* Card Number, Expiry Date, CVV */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="cardNumber" className="text-xs">
                Card Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cardNumber"
                placeholder="4664 5678 8900 1678"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                className={errors.cardNumber ? 'border-red-500' : ''}
              />
              {errors.cardNumber && (
                <p className="text-xs text-red-500">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-xs">
                  Expiry Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="expiryDate"
                    placeholder="04/27"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className={errors.expiryDate ? 'border-red-500' : ''}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {errors.expiryDate && (
                  <p className="text-xs text-red-500">{errors.expiryDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv" className="text-xs">
                  CVV <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cvv"
                  placeholder="109"
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className={errors.cvv ? 'border-red-500' : ''}
                />
                {errors.cvv && (
                  <p className="text-xs text-red-500">{errors.cvv}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
          >
            {isEditMode ? 'Save' : 'Verify'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}