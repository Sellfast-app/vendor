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
  const [bankAccounts] = useState<BankAccount[]>([
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

  const creditCards: CreditCard[] = [
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
  ];

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
  return (
    <div className="w-full space-y-6">
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Bank Account Setup</h3>
              <Button variant="outline" size="sm">
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
            <Button variant="outline" size="sm">
              <span className="hidden sm:inline">Add Card</span>  <CardIcon />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row items-center gap-4'>
            {creditCards.map((card) => (
              <div key={card.id} className="relative mb-4 w-full max-w-[400px]">
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
                <Button  className='w-full'>Upgrade Plan</Button>
               </div>
              </div>
              <div className='flex flex-col gap-5 border p-4 rounded-lg dark:bg-background w-full md:w-1/3'>
                <div>
                   <h3 className='text-sm text-semibold'>Premium Plan</h3>
                   <span className='text-xs'>All features are avaialble</span>
                   </div>
               <div className='flex flex-col gap-2'>
                <div className='flex items-baseline gap-1'><span>₦65,000</span> <span className='text-xs'>per month</span></div>
                <Button  className='w-full'>Upgrade Plan</Button>
               </div>
              </div>
            </div>
          </CardContent>
          <CardContent>
            <h3 className='text-sm font-medium'>Billing History</h3>
          </CardContent>
        </Card>
    </div>
  )
}

export default Finance