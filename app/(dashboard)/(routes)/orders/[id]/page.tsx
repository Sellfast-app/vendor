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
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import Loading from "@/components/Loading";
import { toast } from "sonner";

interface OrderItem {
  price: number;
  discount: number;
  quantity: number;
  product_id: string;
  store_id: string;
  product_name?: string;
  product_image?: string;
  product_images?: string[];
}

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  order_total: string;
  order_total_quantity: number;
  payment_status: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  delivery_note?: string; 
  delivery_notee?: string;
  delivery_fee: string;
  delivery_method: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: Order;
}
const formatOrderDate = (dateString: string | undefined) => {
  if (!dateString) return { date: 'N/A', time: 'N/A' };
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
    
    return {
      date: format(date, 'MMM dd, yyyy'),
      time: format(date, 'hh:mm a')
    };
  } catch (error) {
    return { date: 'Date Error', time: 'Time Error' };
  }
};
export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchOrderDetails();
    fetchAllOrders();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();
      
      console.log('API Response:', result); // Debug log
      
      if (result.status === 'success') {
        // The order data is nested under result.data.order
        if (result.data && result.data.order) {
          setOrder(result.data.order);
        } else {
          toast.error('Order data not found in response');
          // Fallback to localStorage
          const storedOrder = localStorage.getItem('selectedOrder');
          if (storedOrder) {
            setOrder(JSON.parse(storedOrder));
          }
        }
      } else {
        toast.error(result.message || 'Failed to fetch order details');
        // Fallback to localStorage if API fails
        const storedOrder = localStorage.getItem('selectedOrder');
        if (storedOrder) {
          setOrder(JSON.parse(storedOrder));
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      // Fallback to localStorage
      const storedOrder = localStorage.getItem('selectedOrder');
      if (storedOrder) {
        setOrder(JSON.parse(storedOrder));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await fetch('/api/orders?pageSize=100');
      const result = await response.json();

      if (result.status === 'success') {
        setAllOrders(result.data || []);
        
        // Find current index
        if (orderId && result.data) {
          const index = result.data.findIndex((o: Order) => o.id === orderId);
          setCurrentIndex(index !== -1 ? index : 0);
        }
      }
    } catch (error) {
      console.error('Error fetching all orders:', error);
      // Fallback to localStorage
      const storedOrders = localStorage.getItem('filteredOrders');
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        setAllOrders(orders);
        const index = orders.findIndex((o: Order) => o.id === orderId);
        setCurrentIndex(index !== -1 ? index : 0);
      }
    }
  };

  const getShippingProgress = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { review: 100, preparing: 0, shipping: 0, delivered: 0 };
      case 'processing':
        return { review: 100, preparing: 100, shipping: 0, delivered: 0 };
      case 'shipped':
        return { review: 100, preparing: 100, shipping: 100, delivered: 0 };
      case 'fulfilled':
        return { review: 100, preparing: 100, shipping: 100, delivered: 100 };
      default:
        return { review: 100, preparing: 0, shipping: 0, delivered: 0 };
    }
  };

  const navigateToOrder = (direction: 'next' | 'prev') => {
    let newIndex = currentIndex;
    
    if (direction === 'next' && currentIndex < allOrders.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      const newOrder = allOrders[newIndex];
      setOrder(newOrder);
      setCurrentIndex(newIndex);
      localStorage.setItem('selectedOrder', JSON.stringify(newOrder));
      
      // Update URL
      router.push(`/orders/${newOrder.id}`);
    }
  };

  const calculateItemTotal = (item: OrderItem) => {
    if (!item) return 0;
    const price = item.price || 0;
    const discount = item.discount || 0;
    const quantity = item.quantity || 0;
    return (price - discount) * quantity;
  };

  const calculateSubtotal = () => {
    if (!order || !order.order_items || !Array.isArray(order.order_items)) {
      return 0;
    }
    return order.order_items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = parseFloat(order?.delivery_fee || "0");
    return subtotal + deliveryFee;
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loading/>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">The order you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const progress = getShippingProgress(order.order_status);
  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <div className='min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6'>
      {/* Header Section */}
      <div className='flex flex-col lg:flex-row gap-4 lg:justify-between'>
        {/* Left Section */}
        <div className='flex gap-2 sm:gap-4 items-start'>
          <Button 
            variant={"outline"} 
            size="icon"
            onClick={() => router.push(`/orders`)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className='flex flex-col gap-2 min-w-0 flex-1'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-2'> 
              <h3 className='text-sm sm:text-base font-semibold truncate'>Order ID: {order.order_number}</h3> 
              <span className={`text-xs ${
                order.payment_status === 'paid' ? 'text-green-600' : 
                order.payment_status === 'pending' ? 'text-[#F47200]' : 
                'text-red-600'
              } whitespace-nowrap`}>
                Payment {order.payment_status}
              </span>
            </div>
            <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground'>
            <small className='whitespace-nowrap'>Order date {formatOrderDate(order.created_at).date}</small>
              <span className='hidden sm:inline'>•</span>
              <small className='whitespace-nowrap'>Time placed {formatOrderDate(order.created_at).time}</small>
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
              <Button 
                variant={"outline"} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => navigateToOrder('prev')}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant={"outline"} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => navigateToOrder('next')}
                disabled={currentIndex === allOrders.length - 1}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <small className='text-xs whitespace-nowrap'>
              Order {currentIndex + 1} of {allOrders.length}
            </small>
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
                <span className='truncate'>Delivery to {order.customer_address}</span>
                <span className='text-muted-foreground'>Est. arrival within 3-5 business days</span>
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
    {(order.order_items || []).map((item, index) => (
      <div key={item.product_id || index} className='flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center'>
        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden flex items-center justify-center'>
          {/* Use the enriched product_image */}
          {item.product_image ? (
            <Image 
              src={item.product_image} 
              alt={item.product_name ||  'Product'} 
              width={80}
              height={80}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              <span>No Image</span>
            </div>
          )}
        </div>
        <div className='flex-1 min-w-0'>
          {/* Use product_name if available, otherwise fallback to name */}
          <p className='text-xs sm:text-sm text-gray-500 truncate'>
            {item.product_name || `Product ${item.product_id}`}
          </p>
          <p className='font-semibold text-sm sm:text-base mt-1'>₦{(item.price || 0).toLocaleString()}</p>
          {(item.discount || 0) > 0 && (
            <p className='text-xs text-green-600 mt-1'>Discount: ₦{(item.discount || 0).toLocaleString()}</p>
          )}
        </div>
        <div className='flex items-center gap-2 sm:gap-4 justify-between sm:justify-end'>
          <input 
            type="number" 
            value={item.quantity || 0} 
            className='w-16 sm:w-20 px-2 py-1 border rounded-xl text-center text-sm' 
            readOnly
          />
          <span className='font-semibold text-sm sm:text-base sm:w-32 sm:text-right'>
            ₦{calculateItemTotal(item).toLocaleString()}
          </span>
          <button className='text-gray-400 hover:text-gray-600 flex-shrink-0'>
            <Trash />
          </button>
        </div>
      </div>
    ))}
    {(order.order_items || []).length === 0 && (
      <div className="text-center py-4 text-gray-500">
        No order items found
      </div>
    )}
  </CardContent>
  {/* <CardContent className='border-t p-4'>
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
  </CardContent> */}
</Card>

          {/* Order Summary Card */}
          <Card className='shadow-none'>
            <CardHeader className='border-b flex flex-row items-center justify-between p-4'>
              <h4 className='text-sm sm:text-base font-semibold'>Order Summary</h4>
              <span className={`text-xs sm:text-sm ${
                order.payment_status === 'paid' ? 'text-green-600' : 
                order.payment_status === 'pending' ? 'text-[#E76C00]' : 
                'text-red-600'
              } flex items-center gap-1 sm:gap-2`}>
                <PendingGlass/>
                <span className="hidden sm:inline">Payment {order.payment_status}</span>
              </span>
            </CardHeader>
            <CardContent className='p-4 space-y-3'>
              <div className='flex justify-between text-xs sm:text-sm'>
                <span className='text-gray-500'>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className='flex justify-between items-center text-xs sm:text-sm'>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-500'>Delivery Fee</span>
                  <span className='text-gray-400'>{order.delivery_method}</span>
                </div>
                <span>₦{parseFloat(order.delivery_fee || "0").toLocaleString()}</span>
              </div>
              <div className='flex justify-between font-semibold text-sm sm:text-base pt-2 border-t'>
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className='flex justify-between text-xs sm:text-sm text-gray-500'>
                <span>Paid by customer</span>
                <span>₦{order.payment_status === 'paid' ? total.toLocaleString() : '0.00'}</span>
              </div>
            </CardContent>
            {/* <CardContent className='border-t p-4'>
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
            </CardContent> */}
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
      {order.delivery_notee || order.delivery_note || 'No special delivery notes provided.'}
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
            {/* Add null check for customer_name */}
            {(order.customer_name || 'CU').substring(0, 2).toUpperCase()}
          </Avatar> 
          <div className='flex flex-col min-w-0'>
            {/* Add null checks for customer properties */}
            <span className='text-sm sm:text-base truncate'>{order.customer_name || 'Unknown Customer'}</span> 
            <small className='text-xs text-muted-foreground'>{order.order_total_quantity || 0} items</small>
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
      {/* Add null check for customer_address */}
      <small className='text-xs sm:text-sm text-gray-600 whitespace-pre-line'>
        {order.customer_address || 'No address provided'}
      </small>
    </div>
  </CardContent>
  <CardContent className='p-4'>
    <h4 className='text-sm sm:text-base font-semibold mb-2'>Contact Information</h4>
    <div className='flex flex-col text-xs sm:text-sm text-gray-600 gap-1'>
      {/* Add null checks for contact information */}
      <span className='break-all'>{order.customer_email || 'No email provided'}</span>
      <span>{order.customer_phone || 'No phone number provided'}</span>
    </div>
  </CardContent>
</Card>
        </div>
      </div>
    </div>
  );
}