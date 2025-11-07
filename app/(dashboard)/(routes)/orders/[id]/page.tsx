"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { RiShare2Fill } from 'react-icons/ri';
import EditIcon from '@/components/svgIcons/Edit';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import MessageIcon from '@/components/svgIcons/MessageIcon';
import UnfufilledIcon from '@/components/svgIcons/UnfufilledIcon';
import Trash from '@/components/svgIcons/Trash';
import PendingGlass from '@/components/svgIcons/Pendingglass';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

interface Order {
  orderId: string;
  date: string;
  customerName: string;
  payment: string;
  total: number;
  items: number;
  status: string;
  deliveryPartner: string;
  escrow: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const storedOrder = localStorage.getItem('selectedOrder');
    if (storedOrder) {
      setOrder(JSON.parse(storedOrder));
    }
  }, []);

  const getShippingProgress = (status: string) => {
    switch(status) {
      case 'Pending':
        return { review: 100, preparing: 0, shipping: 0, delivered: 0 };
      case 'Processing':
        return { review: 100, preparing: 100, shipping: 0, delivered: 0 };
      case 'Shipped':
        return { review: 100, preparing: 100, shipping: 100, delivered: 0 };
      case 'Fulfilled':
        return { review: 100, preparing: 100, shipping: 100, delivered: 100 };
      default:
        return { review: 100, preparing: 0, shipping: 0, delivered: 0 };
    }
  };

  if (!order) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p>Loading order details...</p>
          <Button onClick={() => router.push('/orders')} className='mt-4'>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const progress = getShippingProgress(order.status);

  return (
    <div className='min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      {/* Header Section */}
      <div className='flex flex-col lg:flex-row gap-4 lg:justify-between'>
        {/* Left Section */}
        <div className='flex gap-2 sm:gap-4 items-start'>
          <Button 
            variant={"outline"} 
            size="icon"
            onClick={()=> router.push(`/orders`)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className='flex flex-col gap-2 min-w-0 flex-1'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-2'> 
              <h3 className='text-sm sm:text-base font-semibold truncate'>Order ID: {order.orderId}</h3> 
              <span className='text-xs text-[#F47200] whitespace-nowrap'>Payment {order.payment}</span>
            </div>
            <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground'>
              <small className='whitespace-nowrap'>Order date {format(new Date(order.date), 'MMM dd, yyyy')}</small>
              <span className='hidden sm:inline'>•</span>
              <small className='whitespace-nowrap'>Time placed 12:30PM</small>
              <span className='hidden sm:inline'>•</span>
              <small className='whitespace-nowrap'>Placed via Storefront</small>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className='flex gap-2 items-center justify-between lg:justify-end'>
          <div className='flex gap-2'>
            <Button variant={"outline"} size="sm">
              <RiShare2Fill className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Export</span>
            </Button>
            <Button variant={"outline"} size="sm">
              <EditIcon />
              <span className="hidden md:inline ml-1">Edit</span>
            </Button>
          </div>
          <div className='flex flex-col gap-2 items-end'>
            <div className='flex gap-1'>
              <Button variant={"outline"} size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button variant={"outline"} size="icon" className="h-8 w-8">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <small className='text-xs whitespace-nowrap'>Order 12 of 30</small>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full gap-3 flex-col xl:flex-row mt-4">
        <div className='space-y-4 sm:space-y-8 w-full xl:w-[65%]'>
          {/* Shipping Progress Card */}
          <Card className='shadow-none'>
            <CardHeader className='border-b p-4'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm'>
                <span className='truncate'>Delivery to 23 Menlo Park, SA</span>
                <span className='text-muted-foreground'>Est. arrival 23rd - 14th Feb, 2025</span>
              </div>
            </CardHeader>
            <CardContent className='p-4 overflow-x-auto'>
              <div className='flex items-center justify-between gap-4 min-w-[600px] sm:min-w-0'>
                <div className='flex flex-col gap-2 flex-1 min-w-[120px]'>
                  <span className='text-xs sm:text-sm font-medium'>Review Order</span>
                  <Progress value={progress.review} className='bg-[#F5F5F5] [&>div]:bg-[#061400]'/>
                </div>
                <div className='flex flex-col gap-2 flex-1 min-w-[120px]'>
                  <span className='text-xs sm:text-sm font-medium'>Preparing Order</span>
                  <Progress value={progress.preparing} className='bg-[#F5F5F5] [&>div]:bg-[#061400]'/>
                </div>
                <div className='flex flex-col gap-2 flex-1 min-w-[120px]'>
                  <span className='text-xs sm:text-sm font-medium'>Shipping</span>
                  <Progress value={progress.shipping} className='bg-[#F5F5F5] [&>div]:bg-[#061400]'/>
                </div>
                <div className='flex flex-col gap-2 flex-1 min-w-[120px]'>
                  <span className='text-xs sm:text-sm font-medium'>Delivered</span>
                  <Progress value={progress.delivered} className='bg-[#F5F5F5] [&>div]:bg-[#061400]'/>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card className='shadow-none'>
            <CardHeader className='flex flex-row items-center justify-between p-4'>
              <h4 className='text-sm sm:text-base font-semibold'>Order Items</h4>
              <span className='text-xs sm:text-sm text-red-500 flex items-center gap-1 sm:gap-2'>
                <UnfufilledIcon />
                <span className="hidden sm:inline">Unfulfilled</span>
              </span>
            </CardHeader>
            <CardContent className='space-y-4 p-4'>
              {/* Item 1 */}
              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center'>
                <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden'>
                  <Image 
                    src="/Macbook.png" 
                    alt="Macbook Pro 14 Inch" 
                    width={80}
                    height={80}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs sm:text-sm text-gray-500 truncate'>Macbook Pro 14 Inch 512GB M1 Pro</p>
                  <p className='font-semibold text-sm sm:text-base mt-1'>₦1,670,900.00</p>
                  <p className='text-xs text-gray-400 mt-1'>Silver / 14 inches</p>
                </div>
                <div className='flex items-center gap-2 sm:gap-4 justify-between sm:justify-end'>
                  <input 
                    type="number" 
                    value="1" 
                    className='w-16 sm:w-20 px-2 py-1 border rounded-xl text-center text-sm' 
                    readOnly
                  />
                  <span className='font-semibold text-sm sm:text-base sm:w-32 sm:text-right'>₦1,670,900.00</span>
                  <button className='text-gray-400 hover:text-gray-600 flex-shrink-0'>
                    <Trash />
                  </button>
                </div>
              </div>

              {/* Item 2 */}
              <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center'>
                <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden'>
                  <Image 
                    src="/Iphone.png" 
                    alt="iPhone 15 Pro Max" 
                    width={80}
                    height={80}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs sm:text-sm text-gray-500 truncate'>Iphone 15 Pro Max 256GB</p>
                  <p className='font-semibold text-sm sm:text-base mt-1'>₦780,990.99</p>
                  <p className='text-xs text-gray-400 mt-1'>Star dust / 6.7 inches</p>
                </div>
                <div className='flex items-center gap-2 sm:gap-4 justify-between sm:justify-end'>
                  <input 
                    type="number" 
                    value="1" 
                    className='w-16 sm:w-20 px-2 py-1 border rounded-xl text-center text-sm' 
                    readOnly
                  />
                  <span className='font-semibold text-sm sm:text-base sm:w-32 sm:text-right'>₦780,990.99</span>
                  <button className='text-gray-400 hover:text-gray-600 flex-shrink-0'>
                    <Trash />
                  </button>
                </div>
              </div>
            </CardContent>
            <CardContent className='border-t p-4'>
              <div className='flex flex-col sm:flex-row gap-2 sm:justify-between'>
                <Button variant="outline" size="sm" className='text-red-500 hover:text-red-600 w-full sm:w-auto'>
                  Cancel order
                </Button>
                <div className='flex gap-2'>
                  <Button variant="outline" size="sm" className='flex-1 sm:flex-none'>
                    Fulfill Item
                  </Button>
                  <Button size="sm" className='flex-1 sm:flex-none'>
                    Create shipping label
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card className='shadow-none'>
            <CardHeader className='border-b flex flex-row items-center justify-between p-4'>
              <h4 className='text-sm sm:text-base font-semibold'>Order Summary</h4>
              <span className='text-xs sm:text-sm text-[#E76C00] flex items-center gap-1 sm:gap-2'>
                <PendingGlass/>
                <span className="hidden sm:inline">Payment pending</span>
              </span>
            </CardHeader>
            <CardContent className='p-4 space-y-3'>
              <div className='flex justify-between text-xs sm:text-sm'>
                <span className='text-gray-500'>Subtotal</span>
                <span>₦{order.total.toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center text-xs sm:text-sm'>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-500'>Discount</span>
                  <span className='text-gray-400'>20%</span>
                </div>
                <span>-₦{(order.total * 0.2).toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center text-xs sm:text-sm pb-3 border-b'>
                <div className='flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2'>
                  <span className='text-gray-500'>Shipping</span>
                  <span className='text-gray-400 text-xs'>{order.deliveryPartner}</span>
                </div>
                <span>₦15,000</span>
              </div>
              <div className='flex justify-between font-semibold text-sm sm:text-base pt-2'>
                <span>Total</span>
                <span>₦{((order.total * 0.8) + 15000).toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-xs sm:text-sm text-gray-500'>
                <span>Paid by customer</span>
                <span>₦0.00</span>
              </div>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2'>
                <span className='text-xs sm:text-sm text-gray-500'>Payment due when invoice is sent</span>
                <button className='text-green-500 hover:text-green-600 text-xs sm:text-sm self-start sm:self-auto'>
                  Edit
                </button>
              </div>
            </CardContent>
            <CardContent className='border-t p-4'>
              <div className='flex flex-col sm:flex-row gap-2 sm:justify-between'>
                <Button variant="outline" size="sm" className='text-red-500 hover:text-red-600 w-full sm:w-auto'>
                  Cancel order
                </Button>
                <div className='flex gap-2'>
                  <Button variant="outline" size="sm" className='flex-1 sm:flex-none'>
                    Send Invoice
                  </Button>
                  <Button size="sm" className='bg-green-500 hover:bg-green-600 text-white flex-1 sm:flex-none'>
                    Collect payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='w-full xl:w-[35%] space-y-4'>
          {/* Order Note Card */}
          <Card className='shadow-none'>
            <CardContent className='flex flex-col gap-4 p-4'>
              <div className='flex justify-between items-center'>
                <h4 className='text-sm sm:text-base font-semibold'>Order Note</h4>
                <EditIcon />
              </div>
              <p className='line-clamp-3 text-xs sm:text-sm text-gray-600'>
                Please wrap the box with a wrapper, so the text is unreadable, this for a birthday present for a 15 y/o kid. The package has to be properly handled
              </p>
            </CardContent>
          </Card>

          {/* Customer Card */}
          <Card className='shadow-none'>
            <CardHeader className='border-b p-4'>
              <div className='flex flex-col gap-3'>
                <h4 className='text-sm sm:text-base font-semibold'>Customer</h4>
                <div className='flex items-center justify-between'>
                  <div className='flex gap-3 items-center min-w-0 flex-1'>
                    <Avatar className='flex-shrink-0'>
                      {order.customerName.substring(0, 2).toUpperCase()}
                    </Avatar> 
                    <div className='flex flex-col min-w-0'>
                      <span className='text-sm sm:text-base truncate'>{order.customerName}</span> 
                      <small className='text-xs text-muted-foreground'>Total: {order.items} orders</small>
                    </div>
                  </div>
                  <Button variant={"outline"} size="icon" className='flex-shrink-0'>
                    <MessageIcon />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='border-b p-4'>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm sm:text-base font-semibold'>Shipping Address</h4>
                  <EditIcon />
                </div>
                <small className='text-xs sm:text-sm text-gray-600'>
                  1226 University Drive
                  Menlo Park CA 94025
                  United States
                </small>
              </div>
            </CardContent>
            <CardContent className='p-4'>
              <h4 className='text-sm sm:text-base font-semibold mb-2'>Contact Information</h4>
              <div className='flex flex-col text-xs sm:text-sm text-gray-600 gap-1'>
                <span className='break-all'>anthoniolaguerta@gmail.com</span>
                <span>+234 809 678 0098</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}