"use client"

import BillingIcon from '@/components/svgIcons/BillingIcon';
import EarningsIcon from '@/components/svgIcons/EarningsIcon';
import EscrowIcon from '@/components/svgIcons/EscrowIcon';
import Withdrawal from '@/components/svgIcons/Withdrawal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import React, { JSX, useState } from 'react'
import { RiShare2Fill } from 'react-icons/ri';
import { Payoutmetrics } from './_components/PayoutMetrics';
import TransactionInflowChart from './_components/TransactionInflowChart';
import PayoutsTab from './_components/PayoutsTab';

interface OverviewMetric {
  id: string;
  icon1: JSX.Element;
  title: string;
  value: string | number;
}


export default function PayoutsPage() {
    const [, setIsExportModalOpen] = useState(false);

    const overviewMetrics: OverviewMetric[] = [
      {
        id: "escrow-balance",
        icon1: <EscrowIcon/>,
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
        icon1: <BillingIcon/>,
        title: "Subscription Billing",
        value: "0",
      },
    ];
  
  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Payouts</h3>
        </div>
        <div className="flex gap-2">
          <Button variant={"outline"}>
            Request Withdrawal <Withdrawal/>
          </Button> 
          <Button onClick={() => setIsExportModalOpen(true)}>
            <RiShare2Fill /> Export
          </Button>
        </div>
      </div>
      <div className='flex w-full gap-3'>
        <div className="space-y-8 w-[65%]">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {overviewMetrics.map((metric) => (
                        <Payoutmetrics key={metric.id} metric={metric} />
                      ))}
                    </div>
                    <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
                      <CardContent>
                        <TransactionInflowChart/>
                      </CardContent>
                      </Card>
                      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
                        <CardContent>
                          <PayoutsTab/>
                        </CardContent>
                      </Card>
        </div>
        <div className="w-[35%]">
          <Card>
            <CardContent>

            </CardContent>
          </Card>
        </div>
        </div>
      </div>
  )
}
