"use client"

import BillingIcon from '@/components/svgIcons/BillingIcon';
import EarningsIcon from '@/components/svgIcons/EarningsIcon';
import EscrowIcon from '@/components/svgIcons/EscrowIcon';
import Withdrawal from '@/components/svgIcons/Withdrawal';
import { Button } from '@/components/ui/button';
import { Card, CardContent,  CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import React, { JSX, useState } from 'react'
import { RiShare2Fill } from 'react-icons/ri';
import {  PlusIcon, Settings } from 'lucide-react';
import { Payoutmetrics } from './_components/PayoutMetrics';
import TransactionInflowChart from './_components/TransactionInflowChart';
import PayoutsTab from './_components/PayoutsTab';
import Accessbank from '@/components/svgIcons/Accessbank';
import CC1 from '@/public/Card1.png';
import CC2 from '@/public/Card2.png';
import Image from 'next/image';
import MastersCardIcon from '@/components/svgIcons/MastersCardIcon';
import { LuEye } from "react-icons/lu";
import { LuEyeClosed } from "react-icons/lu";

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Scrollbar } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';

interface OverviewMetric {
  id: string;
  icon1: JSX.Element;
  title: string;
  value: string | number;
}

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

export default function PayoutsPage() {
  const [, setIsExportModalOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("access-bank-1");
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);

  const overviewMetrics: OverviewMetric[] = [
    {
      id: "escrow-balance",
      icon1: <EscrowIcon />,
      title: "Escrow Balance",
      value: "0",
    },
    {
      id: "total-earnings",
      icon1: <EarningsIcon />,
      title: "Total Earnings",
      value: "0",
    },
    {
      id: "subscription-billing",
      icon1: <BillingIcon />,
      title: "Subscription Billing",
      value: "0",
    },
  ];

  const bankAccounts: BankAccount[] = [
    {
      id: "access-bank-1",
      icon: <Accessbank />,
      accountNumber: "0823869297",
      bankName: "Access Bank",
      accountHolder: "Akpomughe Caleb.O."
    },
    {
      id: "gtb-1",
      icon: <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">GTB</div>,
      accountNumber: "0234567890",
      bankName: "GTBank",
      accountHolder: "Akpomughe Caleb.O."
    },
    {
      id: "zenith-1",
      icon: <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">ZEN</div>,
      accountNumber: "1234567890",
      bankName: "Zenith Bank",
      accountHolder: "Akpomughe Caleb.O."
    },
    {
      id: "uba-1",
      icon: <div className="w-8 h-8 bg-red-700 rounded-full flex items-center justify-center text-white text-xs font-bold">UBA</div>,
      accountNumber: "2345678901",
      bankName: "UBA",
      accountHolder: "Akpomughe Caleb.O."
    },
    {
      id: "fidelity-1",
      icon: <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">FID</div>,
      accountNumber: "3456789012",
      bankName: "Fidelity Bank",
      accountHolder: "Akpomughe Caleb.O."
    },
    {
      id: "sterling-1",
      icon: <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">STR</div>,
      accountNumber: "4567890123",
      bankName: "Sterling Bank",
      accountHolder: "Akpomughe Caleb.O."
    }
  ];

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
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Payouts</h3>
        </div>
        <div className="flex gap-2">
          <Button variant={"outline"}>
            <span className="hidden sm:inline mr-2"> Request Withdrawal</span> <Withdrawal />
          </Button>
          <Button onClick={() => setIsExportModalOpen(true)}>
            <RiShare2Fill />  <span className="hidden sm:inline ml-2">Export</span>
          </Button>
        </div>
      </div>
      <div className='flex w-full gap-3 flex-col xl:flex-row'>
        <div className="space-y-8 w-full xl:w-[65%]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {overviewMetrics.map((metric) => (
              <Payoutmetrics key={metric.id} metric={metric} />
            ))}
          </div>
          <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardContent>
              <TransactionInflowChart />
            </CardContent>
          </Card>
          <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardContent>
              <PayoutsTab />
            </CardContent>
          </Card>
        </div>
        <div className="w-full xl:w-[35%]">
          <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardHeader className='border-b'>
              <div className='flex justify-between items-center'>
                <p className='text-sm'>Available Balance</p>
                <Button variant={"outline"}>Connect Account <Withdrawal /></Button>
              </div>
              <h3 className='text-2xl font-bold mt-2'>₦2,945,090.50</h3>
              <span className="text-xs">+15% from last payout • Last updated 2 minutes ago</span>
              <div className='flex items-center justify-between mt-2 gap-3'>
                <Button className='w-[50%]'> Deposit <Withdrawal color='white' /></Button>
                <Button className='bg-[#5BA3F8] hover:bg-[#5BA3F8]/90 w-[50%]'> Withdraw <Withdrawal color='white' /></Button>
              </div>
            </CardHeader>
            <CardContent className="px-0  border-b">
              <div className="px-6 mb-4">
                <p className='text-sm'>Connected Bank Accounts</p>
              </div>
              <div className="max-h-32 overflow-y-auto px-6">
                <RadioGroup
                  value={selectedBankAccount}
                  onValueChange={setSelectedBankAccount}
                  className="space-y-1"
                >
                  {bankAccounts.map((bank) => (
                    <div key={bank.id} className="flex items-center justify-between gap-3 py-2">
                      <Label
                        htmlFor={bank.id}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        {bank.icon}
                        <div className="flex flex-col">
                          <span className='text-sm'>{bank.accountNumber}</span>
                          <p className="text-xs">{bank.bankName} . {bank.accountHolder}</p>
                        </div>
                      </Label>
                      <RadioGroupItem
                        value={bank.id}
                        id={bank.id}
                        className="flex-shrink-0"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
            <CardContent className='border-b pb-3'>
              <div className='flex justify-between items-center'>
                <p className='text-sm'>Billing Information</p>
                <Button variant={"outline"}>Edit <Settings/></Button>
              </div>
              <div className='bg-[#F5F5F5] dark:bg-background border rounded-lg p-3 space-y-4 mt-4 '>
                <div className='flex items-center justify-between text-sm'><span>Subscription Plan</span> <p>Premium</p></div>
                <div className='flex items-center justify-between text-sm'><span>Amount</span><p>5,000</p></div>
                <div className='flex items-center justify-between text-sm'><span>Duration</span><p>Monthly</p></div>
                <div className='flex items-center justify-between text-sm'><span>Due Date</span> <p>30/09/2025</p></div>
                <div className='flex items-center justify-between text-sm text-primary w-full border-t pt-2'><span>Card</span><p>4664 ****678</p></div>
              </div>
              </CardContent>
              <CardContent>
                <div className='flex justify-between items-center mb-4'>
                   <p className='text-sm'>My Cards</p>
                   <Button variant={"outline"}>Edit <Settings/></Button>
                </div>
                
                <Swiper
                  modules={[Navigation, Scrollbar]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }}
                  scrollbar={{
                    hide: false,
                    draggable: true,
                  }}
                  className="w-full"
                >
                  {creditCards.map((card) => (
                    <SwiperSlide key={card.id}>
                      <div className="relative mb-8">
                        <Image src={card.image} alt={`Card ${card.id}`} className="w-full" />
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
                    </SwiperSlide>
                  ))}
                </Swiper>
                <Button variant={"outline"} className="w-full">Add Card <PlusIcon/></Button>
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}