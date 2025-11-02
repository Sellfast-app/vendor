"use client"
import CardIcon from '@/components/svgIcons/CardIcon'
import MastersCardIcon from '@/components/svgIcons/MastersCardIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PlusIcon } from 'lucide-react'
import React, { JSX, useState } from 'react'
import CC1 from '@/public/Card1.png';
import CC2 from '@/public/Card2.png';
import Image from 'next/image';
import { LuEye, LuEyeClosed } from 'react-icons/lu'
import AddBankModal from "../../payouts/_components/AddBankModal";
import Accessbank from '@/components/svgIcons/Accessbank'
import AddCardModal from '../../payouts/_components/AddCardModal'

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  icon: string;
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

function Finance() {
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      accountNumber: "0102798098",
      bankName: "Access Bank",
      accountHolder: "Olasandra Kayla .A.",
      icon: "/access-bank-icon.png",
    },
    {
      id: "2",
      accountNumber: "9027895098",
      bankName: "Unity",
      accountHolder: "Olasandra Kayla .A.",
      icon: "/unity-bank-icon.png",
    },
    {
      id: "3",
      accountNumber: "2025092169",
      bankName: "Kuda Bank",
      accountHolder: "Olasandra Kayla .A.",
      icon: "/kuda-bank-icon.png",
    },
  ]);

  const [creditCards, setCreditCards] = useState<CreditCard[]>([
    {
      id: "card-1",
      image: CC1,
      cardNumber: "4664 4664 4664 1678",
      cardHolder: "John Doe",
      expiryDate: "10/27",
      cardType: "Credit",
      icon: <MastersCardIcon />
    },
    {
      id: "card-2",
      image: CC2,
      cardNumber: "5234 5234 5234 9876",
      cardHolder: "John Doe",
      expiryDate: "08/29",
      cardType: "Debit",
      icon: <MastersCardIcon />
    }
  ]);

  const toggleCardNumberVisibility = () => {
    setShowCardNumber(!showCardNumber);
  };

  const formatCardNumber = (cardNumber: string) => {
    if (showCardNumber) {
      return cardNumber;
    }
    // Show first 4 and last 4 digits, hide middle 8 digits
    return `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`;
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
      icon: `${getBankIcon(bankData.bankName)}`,
      accountNumber: bankData.accountNumber,
      bankName: bankData.bankName,
      accountHolder: bankData.accountHolder
    };

    setBankAccounts([...bankAccounts, newBank]);
  };

  const handleAddCard = (cardData: {
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  }) => {
    const newCard: CreditCard = {
      id: `card-${creditCards.length + 1}`,
      image: creditCards.length % 2 === 0 ? CC1 : CC2,
      cardNumber: cardData.cardNumber,
      cardHolder: cardData.cardholderName,
      expiryDate: cardData.expiryDate,
      cardType: "Credit",
      icon: <MastersCardIcon />
    };

    setCreditCards([...creditCards, newCard]);
  };

  const handleUpdateCard = (cardId: string, cardData: {
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  }) => {
    setCreditCards(creditCards.map(card =>
      card.id === cardId
        ? {
          ...card,
          cardNumber: cardData.cardNumber,
          cardHolder: cardData.cardholderName,
          expiryDate: cardData.expiryDate
        }
        : card
    ));
    setEditingCard(null);
  };
  return (
    <div className="w-full space-y-6">
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Bank Account Setup</h3>
              <Button variant="outline" size="sm" onClick={() => setIsAddBankModalOpen(true)}>
                <span className="hidden sm:inline">Add Bank Account</span>  <PlusIcon />
              </Button>
            </div>

            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {/* Bank icon placeholder */}
                      <span className="text-xs font-bold">{account.bankName.slice(0, 2)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{account.accountNumber}</h4>
                      <p className="text-xs text-muted-foreground">
                        {account.bankName} . {account.accountHolder}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Card Setup</h3>
            <Button variant="outline" size="sm" onClick={() => setIsAddCardModalOpen(true)}>
              <span className="hidden sm:inline">Add Card</span>  <CardIcon />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row items-center gap-4'>
            {creditCards.map((card) => (
              <div key={card.id} className="relative mb-4 w-full max-w-[400px]" onClick={() => {
                setEditingCard(card);
                setIsAddCardModalOpen(true);
              }}>
                <Image
                  src={card.image}
                  alt={`Card ${card.id}`}
                  className="w-full"
                />
                <div className='absolute top-1 left-2'>{card.icon}</div>
                <h4 className="absolute bottom-1 left-2 text-white text-xs">{card.cardHolder}</h4>
                <span className='absolute bottom-1 left-40 text-white text-xs'>{card.expiryDate}</span>
                <span className="absolute bottom-1 right-2 text-white text-xs">{card.cardType}</span>
                <div className="flex items-center gap-2 absolute left-2 top-15 text-white">
                  <span className="text-sm">{formatCardNumber(card.cardNumber)}</span>
                  <button
                    onClick={toggleCardNumberVisibility}
                    className="p-1"
                  >
                    {showCardNumber ? (
                      <LuEye className="w-4 h-4 text-white" />
                    ) : (
                      <LuEyeClosed className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Billing History Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardHeader className='border-b border-b-[#F5F5F5] dark:border-b-[#1F1F1F]'>
          <h3 className="text-sm font-medium">Billing Plan</h3>
        </CardHeader>
        <CardContent className='border-b border-b-[#F5F5F5] dark:border-b-[#1F1F1F] pb-4'>
          <div className='flex flex-col md:flex-row justify-center items-center gap-2'>
            <div className='flex flex-col gap-5 border p-4 rounded-lg dark:bg-background w-full md:w-1/3'>
              <div className='flex justify-between items-center'>
                <div> <h3 className='text-sm text-semibold'>Basic Plan</h3>
                  <span className='text-xs'>All features are avaialble</span>
                </div>
                <span className='text-sm p-2 bg-card border rounded-md'>Renews  in 14 days</span>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-baseline gap-1'><span>₦10,000</span> <span className='text-xs'>per month</span></div>
                <Button variant={"outline"} className='w-full'>Current Plan</Button>
              </div>
            </div>
            <div className='flex flex-col gap-5 border p-4 rounded-lg dark:bg-background w-full md:w-1/3'>
              <div>
                <h3 className='text-sm text-semibold'>Standard Plan</h3>
                <span className='text-xs'>All features are avaialble</span>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-baseline gap-1'><span>₦25,000</span> <span className='text-xs'>per month</span></div>
                <Button className='w-full'>Upgrade Plan</Button>
              </div>
            </div>
            <div className='flex flex-col gap-5 border p-4 rounded-lg dark:bg-background w-full md:w-1/3'>
              <div>
                <h3 className='text-sm text-semibold'>Premium Plan</h3>
                <span className='text-xs'>All features are avaialble</span>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-baseline gap-1'><span>₦65,000</span> <span className='text-xs'>per month</span></div>
                <Button className='w-full'>Upgrade Plan</Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent>
          <h3 className='text-sm font-medium'>Billing History</h3>
        </CardContent>
      </Card>
      <AddBankModal
        isOpen={isAddBankModalOpen}
        onClose={() => setIsAddBankModalOpen(false)}
        onAddBank={handleAddBank}
      />
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => {
          setIsAddCardModalOpen(false);
          setEditingCard(null);
        }}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        editCard={editingCard}
        isEditMode={!!editingCard}
      />
    </div>
  )
}

export default Finance