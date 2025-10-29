"use client";

import React, { JSX, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, EyeOff, Check } from 'lucide-react';
import Image from 'next/image';
import WithdrawalConfirmationModal from './WithdrawalConfirmationModal';

interface BankAccount {
  id: string;
  icon: JSX.Element;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
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

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, paymentMethod: string, selectedId: string, otp: string) => void;
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  userEmail: string;
  onResendOTP?: () => void;
}

export default function WithdrawalModal({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  bankAccounts, 
  creditCards,
  userEmail,
  onResendOTP
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card' | ''>('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [selectedCard, setSelectedCard] = useState(0);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setAmount(numericValue);
    if (error) setError('');
  };

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (paymentMethod === 'bank' && !selectedBankAccount) {
      setError('Please select a bank account');
      return;
    }

    // Show confirmation modal with OTP
    setShowConfirmModal(true);
  };

  const handleConfirmWithdrawal = (otp: string) => {
    const selectedId = paymentMethod === 'bank' 
      ? selectedBankAccount 
      : creditCards[selectedCard]?.id || '';

    onWithdraw(parseFloat(amount), paymentMethod, selectedId, otp);
    setShowConfirmModal(false);
    handleCancel();
  };

  const handleCancel = () => {
    setAmount('');
    setPaymentMethod('');
    setSelectedBankAccount('');
    setSelectedCard(0);
    setShowCardNumber(false);
    setError('');
    onClose();
  };

  const formatCardNumber = (cardNumber: string) => {
    if (showCardNumber) {
      return cardNumber;
    }
    return `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get selected account/card details for confirmation modal
  const getSelectedAccountDetails = () => {
    if (paymentMethod === 'bank') {
      const account = bankAccounts.find(acc => acc.id === selectedBankAccount);
      return {
        icon: account?.icon || <></>,
        accountNumber: account?.accountNumber || '',
        bankName: account?.bankName || '',
        accountHolder: account?.accountHolder || '',
      };
    } else {
      const card = creditCards[selectedCard];
      return {
        icon: card?.icon || <></>,
        accountNumber: card?.cardNumber || '',
        bankName: card?.cardType || '',
        accountHolder: card?.cardHolder || '',
      };
    }
  };

  const selectedDetails = getSelectedAccountDetails();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Withdrawal from Balance</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Specify the details about this order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  ₦
                </span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              {error && error.includes('amount') && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-xs">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(value: 'bank' | 'card') => {
                  setPaymentMethod(value);
                  if (error) setError('');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Accounts</SelectItem>
                  <SelectItem value="card">Cards</SelectItem>
                </SelectContent>
              </Select>
              {error && error.includes('payment method') && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>

            {/* Bank Accounts List */}
            {paymentMethod === 'bank' && (
              <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
                <RadioGroup
                  value={selectedBankAccount}
                  onValueChange={setSelectedBankAccount}
                  className="space-y-3"
                >
                  {bankAccounts.map((bank) => (
                    <div 
                      key={bank.id} 
                      className="flex items-center justify-between gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Label
                        htmlFor={`withdraw-${bank.id}`}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        {bank.icon}
                        <div className="flex flex-col">
                          <span className='text-sm font-medium'>{bank.accountNumber}</span>
                          <p className="text-xs text-gray-500">{bank.bankName} • {bank.accountHolder}</p>
                        </div>
                      </Label>
                      <div className="relative">
                        <RadioGroupItem
                          value={bank.id}
                          id={`withdraw-${bank.id}`}
                          className="flex-shrink-0"
                        />
                        {selectedBankAccount === bank.id && (
                          <Check className="w-4 h-4 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                {error && error.includes('bank account') && (
                  <p className="text-xs text-red-500 mt-2">{error}</p>
                )}
              </div>
            )}

            {/* Cards Carousel */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="flex gap-4 overflow-x-scroll pb-4">
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
                      <div className='absolute top-3 left-4'>{card.icon}</div>
                      <h4 className="absolute bottom-3 left-4 text-white text-sm">{card.cardHolder}</h4>
                      <span className='absolute bottom-3 left-1/2 transform -translate-x-1/2 text-white text-sm'>{card.expiryDate}</span>
                      <span className="absolute bottom-3 right-4 text-white text-sm">{card.cardType}</span>
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
            )}
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
              Withdraw
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal with OTP */}
      <WithdrawalConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmWithdrawal}
        accountIcon={selectedDetails.icon}
        accountNumber={selectedDetails.accountNumber}
        bankName={selectedDetails.bankName}
        accountHolder={selectedDetails.accountHolder}
        amount={formatAmount(amount)}
        email={userEmail}
        onResendOTP={onResendOTP}
      />
    </>
  );
}