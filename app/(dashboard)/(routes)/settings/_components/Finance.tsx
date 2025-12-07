"use client"
import CardIcon from '@/components/svgIcons/CardIcon'
import MastersCardIcon from '@/components/svgIcons/MastersCardIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { PlusIcon } from 'lucide-react'
import React, { JSX, useState } from 'react'
import CC1 from '@/public/Card1.png';
import CC2 from '@/public/Card2.png';
import Image from 'next/image';
import { LuEye, LuEyeClosed } from 'react-icons/lu'
import AddBankModal from "../../payouts/_components/AddBankModal";
import Accessbank from '@/components/svgIcons/Accessbank'
import AddCardModal from '../../payouts/_components/AddCardModal'
import PdfIcon from '@/components/svgIcons/PdfIcon'
import DownloadIcon from '@/components/svgIcons/DownloadIcon'

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

interface BillingHistory {
  id: string;
  invoice: string;
  date: string;
  plan: string;
  amount: string;
}

function Finance() {
  const [showCardNumber, setShowCardNumber] = useState<boolean>(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([

  ]);

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

  // Billing History Mock Data - 12 samples
  const allBillingHistory: BillingHistory[] = [
    // { id: "1", invoice: "Invoice #0001", date: "12 Apr 2025", plan: "Basic Plan", amount: "₦10,000" },
    // { id: "2", invoice: "Invoice #0002", date: "28 Mar 2025", plan: "Basic Plan", amount: "₦10,000" },
    // { id: "3", invoice: "Invoice #0003", date: "15 Mar 2025", plan: "Standard Plan", amount: "₦25,000" },
    // { id: "4", invoice: "Invoice #0004", date: "01 Mar 2025", plan: "Standard Plan", amount: "₦25,000" },
    // { id: "5", invoice: "Invoice #0005", date: "14 Feb 2025", plan: "Basic Plan", amount: "₦10,000" },
    // { id: "6", invoice: "Invoice #0006", date: "31 Jan 2025", plan: "Premium Plan", amount: "₦65,000" },
    // { id: "7", invoice: "Invoice #0007", date: "17 Jan 2025", plan: "Premium Plan", amount: "₦65,000" },
    // { id: "8", invoice: "Invoice #0008", date: "03 Jan 2025", plan: "Standard Plan", amount: "₦25,000" },
    // { id: "9", invoice: "Invoice #0009", date: "20 Dec 2024", plan: "Basic Plan", amount: "₦10,000" },
    // { id: "10", invoice: "Invoice #0010", date: "07 Dec 2024", plan: "Basic Plan", amount: "₦10,000" },
    // { id: "11", invoice: "Invoice #0011", date: "24 Nov 2024", plan: "Standard Plan", amount: "₦25,000" },
    // { id: "12", invoice: "Invoice #0012", date: "11 Nov 2024", plan: "Premium Plan", amount: "₦65,000" },
  ];

  // Pagination configuration
  const itemsPerPage = 6;
  const totalPages = Math.ceil(allBillingHistory.length / itemsPerPage);

  // Calculate current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBillingHistory = allBillingHistory.slice(startIndex, endIndex);

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

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        end = 3;
      }
      
      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handleDownloadInvoice = (invoice: BillingHistory) => {
    // Mock download functionality
    console.log('Downloading invoice:', invoice);
    // In a real app, this would trigger a file download
    alert(`Downloading ${invoice.invoice}`);
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
      {/* <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
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
      </Card> */}
      {/* Billing History Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardHeader className='border-b border-b-[#F5F5F5] dark:border-b-[#1F1F1F]'>
          <h3 className="text-sm font-medium">Billing Plan</h3>
        </CardHeader>
        <CardContent className='border-b border-b-[#F5F5F5] dark:border-b-[#1F1F1F] pb-4'>
          <div className='flex flex-col md:flex-row justify-center items-center gap-2'>
            <div className='flex flex-col gap-5 border p-4 rounded-lg dark:bg-background w-full md:w-1/3'>
              <div className='flex justify-between items-center'>
                <div> <h3 className='text-sm text-semibold'>Free Plan</h3>
                  <span className='text-xs'>All features are avaialble</span>
                </div>
                {/* <span className='text-sm p-2 bg-card border rounded-md'>Renews  in 14 days</span> */}
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-baseline gap-1'><span>Free</span> <span className='text-xs'>for the first month</span></div>
                <Button variant={"outline"} className='w-full'>Current Plan</Button>
              </div>
            </div>
            <div className='flex flex-col gap-5 border p-4 rounded-lg dark:bg-background w-full md:w-1/3'>
              <div>
                <h3 className='text-sm text-semibold'>Standard Plan</h3>
                <span className='text-xs'>All features are avaialble</span>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-baseline gap-1'><span>₦5,000</span> <span className='text-xs'>per month</span></div>
                <Button className='w-full'>Upgrade Plan</Button>
              </div>
            </div>
            <div className='flex flex-col gap-5 border p-4 rounded-lg dark:bg-background w-full md:w-1/3'>
              <div>
                <h3 className='text-sm text-semibold'>Premium Plan (6months)</h3>
                <span className='text-xs'>All features are avaialble</span>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-baseline gap-1'><span>₦28,000</span> <span className='text-xs'>per month</span></div>
                <Button className='w-full'>Upgrade Plan</Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent>
          <div className="space-y-4">
            <h3 className='text-sm font-medium'>Billing History</h3>
            
            {/* Billing History Table without headers */}
            <Table>
              <TableBody>
                {currentBillingHistory.map((invoice) => (
                  <TableRow key={invoice.id} className="border-b last:border-b-0">
                    <TableCell className="font-medium py-6 flex items-center gap-1"><PdfIcon /> {invoice.invoice}</TableCell>
                    <TableCell className="">{invoice.date}</TableCell>
                    <TableCell className="">{invoice.plan}</TableCell>
                    <TableCell className="">{invoice.amount}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <DownloadIcon  />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8"
              >
                <span className="text-sm">&lt;</span>
              </Button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-2 text-sm text-muted-foreground">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                      className="w-8 h-8"
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}

              {/* Next Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8"
              >
                <span className="text-sm">&gt;</span>
              </Button>
            </div>

            {/* Page Info */}
            <div className="text-center text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, allBillingHistory.length)} of {allBillingHistory.length} invoices
            </div>
          </div>
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