"use client";

import React, { JSX, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Check, Plus, Loader2 } from 'lucide-react';
import Image from 'next/image';

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

interface UpdateBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionPlan: string, selectedCardId: string) => Promise<void> | void;
  onAddCard: () => void;
  creditCards: CreditCard[];
  currentPlan?: string;
  currentCardId?: string;
}

export default function UpdateBillingModal({
  isOpen,
  onClose,
  onSave,
  onAddCard,
  creditCards,
  currentPlan = 'premium',
  currentCardId,
}: UpdateBillingModalProps) {
  const [subscriptionPlan, setSubscriptionPlan] = useState(currentPlan);
  const [selectedCard, setSelectedCard] = useState(() => {
    const currentIndex = creditCards.findIndex(card => card.id === currentCardId);
    return currentIndex !== -1 ? currentIndex : 0;
  });
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedCardId = creditCards[selectedCard]?.id || '';
      await onSave(subscriptionPlan, selectedCardId);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCardClick = () => {
    onClose(); // Close this modal first
    onAddCard(); // Then open the add card modal
  };

  const formatCardNumber = (cardNumber: string) => {
    if (showCardNumber) {
      return cardNumber;
    }
    return `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Update Billing</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Specify the details about this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Subscription Plan Selector */}
          <div className="space-y-2">
            <Label htmlFor="subscriptionPlan" className="text-xs">
              Subscription Plan <span className="text-red-500">*</span>
            </Label>
            <Select value={subscriptionPlan} onValueChange={setSubscriptionPlan}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cards Display */}
          {creditCards.length > 0 ? (
            <div className="space-y-4">
              <div className="flex gap-4 overflow-x-scroll">
                {creditCards.map((card, index) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(index)}
                    className={`relative w-full cursor-pointer transition-all ${
                      selectedCard === index ? 'scale-105' : 'opacity-70'
                    }`}
                  >
                    <Image
                      src={card.image}
                      alt={`Card ${card.id}`}
                      className="w-full h-35 rounded-lg"
                    />
                    <div className="absolute top-3 left-4">{card.icon}</div>
                    <h4 className="absolute bottom-3 left-4 text-white text-sm">
                      {card.cardHolder}
                    </h4>
                    <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-white text-sm">
                      {card.expiryDate}
                    </span>
                    <span className="absolute bottom-3 right-4 text-white text-sm">
                      {card.cardType}
                    </span>
                    <div className="flex items-center gap-2 absolute left-4 top-1/2 transform -translate-y-1/2 text-white">
                      <span className="text-base">{formatCardNumber(card.cardNumber)}</span>
                      {selectedCard === index && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCardNumber(!showCardNumber);
                          }}
                          className="p-1"
                        >
                          {showCardNumber ? (
                            <Eye className="w-4 h-4 text-white" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-white" />
                          )}
                        </button>
                      )}
                    </div>
                    {selectedCard === index && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No cards available. Please add a card to continue.
            </div>
          )}

          {/* Add Card Button */}
          <div className="flex w-full justify-center">
            <Button
              variant="outline"
              onClick={handleAddCardClick}
              className="w-full"
            >
              Add Card <Plus className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || creditCards.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Save
              </>
            ) : (
              'Saving'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}