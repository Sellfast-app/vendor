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
    // Get order from localStorage
    const storedOrder = localStorage.getItem('selectedOrder');
    if (storedOrder) {
      setOrder(JSON.parse(storedOrder));
    }
  }, []);

  // Function to get progress values based on shipping status
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
      <div className='flex justify-between'>
        <div className='flex gap-4'>
          <Button variant={"outline"} onClick={()=> router.push(`/orders`)}><ArrowLeft /> </Button>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-4'> 
              <h3>Order ID: {order.orderId}</h3> 
              <span className='text-xs text-[#F47200]'>Payment {order.payment}</span>
            </div>
            <div className='flex items-center gap-3'>
              <small>Order date {format(new Date(order.date), 'MMM dd, yyyy')}</small>. 
              <small>Time placed 12:30PM</small>. 
              <small>Placed via Storefront</small>
            </div>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant={"outline"}>   <RiShare2Fill /> <span className="hidden sm:inline ml-2">Export</span>  </Button>
          <Button variant={"outline"}>   <EditIcon /> <span className="hidden sm:inline ">Edit</span>  </Button>
          <div className='flex flex-col gap-2'>
            <div> <Button variant={"outline"}><ArrowLeft /></Button><Button variant={"outline"}><ArrowRight /></Button></div>
            <small>Order 12 of 30</small>
          </div>
        </div>
      </div>
      <div className="flex w-full gap-3 flex-col xl:flex-row mt-4">
        <div className='space-y-8 w-full xl:w-[65%]'>
          <Card className='shadow-none'>
            <CardHeader className='border-b flex items-center justify-between'>
              <small>Delivery to 23 Menlo Park, SA</small>
              <small>Estimated arrival at 23rd to 14th February, 2025</small>
            </CardHeader>
            <CardContent className='flex items-center justify-between'>
              <div className='flex flex-col gap-2'>
                <span className='text-sm font-medium'>Review Order</span>
                <Progress value={progress.review} className='bg-[#F5F5F5] [&>div]:bg-[#061400]'/>
              </div>
              <div className='flex flex-col gap-2'>
                <span className='text-sm font-medium'>Preparing Order</span>
                <Progress value={progress.preparing} className='bg-[#F5F5F5] [&>div]:bg-[#061400]'/>
              </div>
              <div className='flex flex-col gap-2'>
                <span className='text-sm font-medium'>Shipping</span>
                <Progress value={progress.shipping} className='bg-[#F5F5F5] [&>div]:bg-[#061400]'/>
              </div>
              <div className='flex flex-col gap-2'>
                <span className='text-sm font-medium'>Delivered</span>
                <Progress value={progress.delivered} className='bg-[#F5F5F5] [&>div]:bg-[#061400]'/>
              </div>
            </CardContent>
          </Card>
          <Card className='shadow-none'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <h4>Order Items</h4>
              <span className='text-sm text-red-500 flex items-center gap-2'>
                <UnfufilledIcon />
                Unfulfilled
              </span>
            </CardHeader>
            <CardContent className='space-y-4 py-4'>
              <div className='flex items-center gap-4'>
                <div className='w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden'>
                  <img src="/Macbook.png" alt="iPhone 15 Pro Max" className='w-full h-full object-cover' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm text-gray-500'>Macbook Pro 14 Inch 512GB M1 Pro</p>
                  <p className='font-semibold mt-1'>₦1,670,900.00</p>
                  <p className='text-xs text-gray-400 mt-1'>Silver / 14 inches</p>
                </div>
                <div className='flex items-center gap-4'>
                  <input type="number" value="1" className='w-20 px-2 py-1 border rounded-xl text-center' />
                  <span className='font-semibold w-32 text-right'>₦1,670,900.00</span>
                  <button className='text-gray-400 hover:text-gray-600'>
                    <Trash />
                  </button>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <div className='w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden'>
                  <img src="/Iphone.png" alt="iPhone 15 Pro Max" className='w-full h-full object-cover' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm text-gray-500'>Iphone 15 Pro Max 256GB</p>
                  <p className='font-semibold mt-1'>₦780,990.99</p>
                  <p className='text-xs text-gray-400 mt-1'>Star dust / 6.7 inches</p>
                </div>
                <div className='flex items-center gap-4'>
                  <input type="number" value="1" className='w-20 px-2 py-1 border rounded-xl text-center' />
                  <span className='font-semibold w-32 text-right'>₦780,990.99</span>
                  <button className='text-gray-400 hover:text-gray-600'>
                    <Trash />
                  </button>
                </div>
              </div>
            </CardContent>
            <CardContent className='border-t'>
              <div className='flex justify-between pt-4'>
                <Button variant="outline" className='text-red-500 hover:text-red-600'>Cancel order</Button>
                <div className='flex gap-2'>
                  <Button variant="outline">Fulfill Item</Button>
                  <Button >Create shipping label</Button>
                </div>
              </div></CardContent>
          </Card>

          <Card className='shadow-none'>
            <CardHeader className='border-b flex flex-row items-center justify-between'>
              <h4>Order Summary</h4>
              <span className='text-sm text-[#E76C00] flex items-center gap-2'>
              <PendingGlass/>
                Payment pending
              </span>
            </CardHeader>
            <CardContent className='py-4 space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Subtotal</span>
                <span>₦{order.total.toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center text-sm'>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-500'>Discount</span>
                  <span className='text-gray-400'>20%</span>
                </div>
                <span>-₦{(order.total * 0.2).toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center text-sm pb-3 border-b'>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-500'>Shipping</span>
                  <span className='text-gray-400'>{order.deliveryPartner}</span>
                </div>
                <span>₦15,000</span>
              </div>
              <div className='flex justify-between font-semibold pt-2'>
                <span>Total</span>
                <span>₦{((order.total * 0.8) + 15000).toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Paid by customer</span>
                <span>₦0.00</span>
              </div>
              <div className='flex justify-between text-sm items-center pt-2'>
                <span className='text-gray-500'>Payment due when invoice is sent</span>
                <button className='text-green-500 hover:text-green-600 text-sm'>Edit</button>
              </div>
            </CardContent>
            <CardContent className='border-t'>
              <div className='flex justify-between pt-4'>
                <Button variant="outline" className='text-red-500 hover:text-red-600'>Cancel order</Button>
                <div className='flex gap-2'>
                  <Button variant="outline">Send Invoice</Button>
                  <Button className='bg-green-500 hover:bg-green-600 text-white'>Collect payment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='w-full xl:w-[35%]'>
          <Card className='shadow-none'>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex justify-between items-center'>
                <h4>Order Note</h4>
                <EditIcon />
              </div>
              <p className='line-clamp-2 text-sm'>Please wrap the box with a wrapper, so the text is unreadable, this for a birthday present for a 15 y/o kid. The package has to be properly handled</p>
            </CardContent>
          </Card>
          <Card className='shadow-none mt-4'>
            <CardHeader className='border-b'>
              <div className='flex flex-col gap-3'>
                <h4>Customer</h4>
                <div className='flex items-center justify-between'>
                  <div className='flex'>
                    <Avatar>{order.customerName.substring(0, 2).toUpperCase()}</Avatar> 
                    <div className='flex flex-col'>
                      <span>{order.customerName}</span> 
                      <small>Total: {order.items} orders</small>
                    </div>
                  </div>
                  <Button variant={"outline"}><MessageIcon /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='border-b pb-2'>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center justify-between'>
                  <h4>Shipping Address</h4>
                  <EditIcon />
                </div>
                <small>1226 University Drive
                  Menlo Park CA 94025
                  United States</small>
              </div>
            </CardContent>
            <CardContent>
              <h4>Contact Information</h4>
              <div className='flex flex-col text-xs mt-2'>
                <span>anthoniolaguerta@gmail.com</span>
                <span>+234 809 678 0098</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}