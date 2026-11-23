"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import AccountInformation from './AccountInformation'
import StoreFront from './StoreFront'
import Finance from './Finance'
import Notification from './Notification'
import Support from './Support'
import LocalizationSettings from './LocalizationSettings'
import { useStoreBusiness } from '@/components/store-business-context'
import StaffStoreSettings from './StaffStoreSettings'

function SettingsTabs() {
    const { businessType } = useStoreBusiness()
    const isTicketStore = businessType === 'ticketing'
    const [isStaff, setIsStaff] = useState<boolean | null>(null)
    const [tab, setTab] = useState('account')
    useEffect(() => {
        setIsStaff(document.cookie.split('; ').some(cookie => cookie === 'user_role=vendor_staff'))
    }, [])
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.has('subscription_payment')) setTab('finance')
    }, [])
    if (isStaff === null) return <div className="h-32 animate-pulse rounded-md bg-muted/50" aria-label="Loading settings access" />
    if (isStaff) return <StaffStoreSettings />
    return (
        <div className="container mx-auto w-full min-w-0 p-4">
            <Tabs value={tab} onValueChange={setTab} className='w-full'>
            <TabsList className="w-full overflow-x-auto flex-nowrap justify-start scrollbar-hide">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="store">StoreFront Settings</TabsTrigger>
                    {!isTicketStore && <TabsTrigger value="localization">Localization</TabsTrigger>}
                    <TabsTrigger value="finance">Finance & Billings</TabsTrigger>
                    <TabsTrigger value="notification">Notifications</TabsTrigger>
                    <TabsTrigger value="support">Support & Help</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className='mt-4 min-w-0'>
                    <AccountInformation/>
                </TabsContent>
                <TabsContent value="store" className='mt-4 min-w-0'>
                    <StoreFront/>
                </TabsContent>
                {!isTicketStore && <TabsContent value="localization" className='mt-4 min-w-0'>
                    <LocalizationSettings onManageBranches={() => {
                        setTab('store')
                        window.setTimeout(() => document.getElementById('branch-pickup-locations')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                    }}/>
                </TabsContent>}
                <TabsContent value="finance" className='mt-4 min-w-0'>
                    <Finance/>
                </TabsContent>
                <TabsContent value="notification" className='mt-4 min-w-0'>
                    <Notification/>
                </TabsContent>
                <TabsContent value='support' className='min-w-0'>
                    <Support/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SettingsTabs
