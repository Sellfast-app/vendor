"use client"

import BillingIcon from '@/components/svgIcons/BillingIcon';
import EarningsIcon from '@/components/svgIcons/EarningsIcon';
import EscrowIcon from '@/components/svgIcons/EscrowIcon';
import Withdrawal from '@/components/svgIcons/Withdrawal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import React, { JSX, useState } from 'react'
import { RiShare2Fill } from 'react-icons/ri';
import { PlusIcon, Settings } from 'lucide-react';
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
import AddCardModal from './_components/AddCardModal';
import DepositModal from './_components/DepositModal';
import WithdrawalModal from './_components/WithdrawalModal';
import UpdateBillingModal from './_components/UpdateBillingModal';
import AddBankModal from './_components/AddBankModal';
import { ExportModal } from "@/components/ExportModal";

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
   const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("access-bank-1");
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isUpdateBillingModalOpen, setIsUpdateBillingModalOpen] = useState(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([
    // {
    //   id: "card-1",
    //   image: CC1,
    //   cardNumber: "4664 4664 4664 1678",
    //   cardHolder: "John Doe",
    //   expiryDate: "10/27",
    //   cardType: "Credit",
    //   icon: <MastersCardIcon />
    // },
    // {
    //   id: "card-2",
    //   image: CC2,
    //   cardNumber: "5234 5234 5234 9876",
    //   cardHolder: "John Doe",
    //   expiryDate: "08/29",
    //   cardType: "Debit",
    //   icon: <MastersCardIcon />
    // }
  ]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
  ]);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState('premium');
  const [billingCardId, setBillingCardId] = useState('card-1');

  const overviewMetrics: OverviewMetric[] = [
    
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
  

  const toggleCardNumberVisibility = () => {
    setShowCardNumber(!showCardNumber);
  };

  const formatCardNumber = (cardNumber: string) => {
    if (showCardNumber) {
      return cardNumber;
    }
    return `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`;
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

  const handleDeleteCard = (cardId: string) => {
    setCreditCards(creditCards.filter(card => card.id !== cardId));
    setEditingCard(null);
  };

  const handleDeposit = async (amount: number, paymentMethod: string, selectedId: string) => {
    console.log('Deposit:', { amount, paymentMethod, selectedId });
    // Add your deposit logic here
  };

  const handleWithdraw = (amount: number, paymentMethod: string, selectedId: string, otp: string) => {
    console.log('Withdraw:', { amount, paymentMethod, selectedId, otp });
    // Add your withdrawal logic here
  };

  const handleUpdateBilling = async (plan: string, cardId: string) => {
    console.log('Update Billing:', { plan, cardId });
    setSubscriptionPlan(plan);
    setBillingCardId(cardId);
    // Add your update billing logic here (API call)
  };

  const handleAddCardFromBilling = () => {
    setIsAddCardModalOpen(true);
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
  };

  // Get billing card details
  const billingCard = creditCards.find(card => card.id === billingCardId);

  const fieldOptions = [
    ...overviewMetrics.map((metric) => ({
      label: metric.title,
      value: metric.id,
    })),
    { label: "Available Balance", value: "Available Balance" },
    { label: "Transaction inflow Vs Outflow", value: "Transaction inflow Vs Outflow" },
    { label: "Withdrawals", value: "Withdrawals" },
    { label: "Connected Bank Accounts", value: "Connected Bank Accounts" },
    { label: "Billing Information", value: "Billing Information" },
  ];

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Payouts</h3>
        </div>
        <div className="flex gap-2">
          {/* <Button variant={"outline"} onClick={() => setIsWithdrawalModalOpen(true)}>
            <span className="hidden sm:inline mr-2"> Request Withdrawal</span> <Withdrawal />
          </Button> */}
          <Button onClick={() => setIsExportModalOpen(true)}>
            <RiShare2Fill />  <span className="hidden sm:inline ml-2">Export</span>
          </Button>
        </div>
      </div>
      <div className='flex w-full gap-3 flex-col xl:flex-row'>
        <div className="space-y-8 w-full xl:w-[65%]">
          <div className="grid grid-cols-1 md:grid-cols-2  gap-2">
            {overviewMetrics.map((metric) => (
              <Payoutmetrics key={metric.id} metric={metric} />
            ))}
          </div>
          {/* <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardContent>
              <TransactionInflowChart />
            </CardContent>
          </Card> */}
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
                {/* <p className='text-sm'>Available Balance</p> */}
                <Button variant={"outline"} onClick={() => setIsAddBankModalOpen(true)}>
                  Connect Account <Withdrawal />
                </Button>
              </div>
              {/* <h3 className='text-2xl font-bold mt-2'>₦0</h3>
              <span className="text-xs">+15% from last payout • Last updated 2 minutes ago</span> */}
              {/* <div className='flex items-center justify-between mt-2 gap-3'>
                <Button className='w-[50%]' onClick={() => setIsDepositModalOpen(true)}> Deposit <Withdrawal color='white' /></Button>
                <Button className='bg-[#5BA3F8] hover:bg-[#5BA3F8]/90 w-[50%]' onClick={() => setIsWithdrawalModalOpen(true)}> Withdraw <Withdrawal color='white' /></Button>
              </div> */}
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
                <Button variant={"outline"} onClick={() => setIsUpdateBillingModalOpen(true)} disabled>
                  Edit <Settings />
                </Button>
              </div>
              <div className='bg-[#F5F5F5] dark:bg-background border rounded-lg p-3 space-y-4 mt-4 '>
                <div className='flex items-center justify-between text-sm'>
                  <span>Subscription Plan</span> 
                  <p className="capitalize">{subscriptionPlan}</p>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span>Amount</span>
                  <p>5,000</p>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span>Duration</span>
                  <p>Monthly</p>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span>Due Date</span> 
                  <p>30/09/2025</p>
                </div>
                <div className='flex items-center justify-between text-sm text-primary w-full border-t pt-2'>
                  <span>Card</span>
                  <p>{billingCard?.cardNumber.slice(0, 4)} ****{billingCard?.cardNumber.slice(-3)}</p>
                </div>
              </div>
            </CardContent>
            <CardContent>
              <div className='flex justify-between items-center mb-4'>
                <p className='text-sm'>My Cards</p>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    setEditingCard(creditCards[currentCardIndex]);
                    setIsAddCardModalOpen(true);
                  }} disabled
                >Edit <Settings /></Button>
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
                onSlideChange={(swiper) => setCurrentCardIndex(swiper.activeIndex)}
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
              <Button variant={"outline"} className="w-full" onClick={() => setIsAddCardModalOpen(true)} disabled>
                Add Card <PlusIcon />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => {
          setIsAddCardModalOpen(false);
          setEditingCard(null);
        }}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        editCard={editingCard}
        isEditMode={!!editingCard}
      />
      
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDeposit={handleDeposit}
        bankAccounts={bankAccounts}
        creditCards={creditCards}
      />
      
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onWithdraw={handleWithdraw}
        bankAccounts={bankAccounts}
        creditCards={creditCards}
        userEmail="user@example.com"
      />
      
      <UpdateBillingModal
        isOpen={isUpdateBillingModalOpen}
        onClose={() => setIsUpdateBillingModalOpen(false)}
        onSave={handleUpdateBilling}
        onAddCard={handleAddCardFromBilling}
        creditCards={creditCards}
        currentPlan={subscriptionPlan}
        currentCardId={billingCardId}
      />

      <AddBankModal
        isOpen={isAddBankModalOpen}
        onClose={() => setIsAddBankModalOpen(false)}
        onAddBank={handleAddBank}
      />
       <ExportModal
              isOpen={isExportModalOpen}
              onClose={() => setIsExportModalOpen(false)}
              endpointPrefix="Payouts"
              fieldOptions={fieldOptions}
              dataName="Payouts"
            />
    </div>
  )
}