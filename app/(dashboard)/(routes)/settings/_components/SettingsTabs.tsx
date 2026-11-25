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
        <div className="mx-auto w-full min-w-0 max-w-full px-0 py-4 sm:px-4">
            <Tabs value={tab} onValueChange={setTab} className="w-full min-w-0">
            <TabsList className="block h-auto w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden whitespace-nowrap py-1 scrollbar-hide">
                <div className="flex w-max min-w-full flex-nowrap justify-start gap-1">
                    <TabsTrigger className="flex-none px-3" value="account">Account</TabsTrigger>
                    <TabsTrigger className="flex-none px-3" value="store">StoreFront Settings</TabsTrigger>
                    {!isTicketStore && <TabsTrigger className="flex-none px-3" value="localization">Localization</TabsTrigger>}
                    <TabsTrigger className="flex-none px-3" value="finance">Finance & Billings</TabsTrigger>
                    <TabsTrigger className="flex-none px-3" value="notification">Notifications</TabsTrigger>
                    <TabsTrigger className="flex-none px-3" value="support">Support & Help</TabsTrigger>
                </div>
                </TabsList>
                <TabsContent value="account" className="mt-4 min-w-0 max-w-full overflow-x-auto">
                    <AccountInformation/>
                </TabsContent>
                <TabsContent value="store" className="mt-4 min-w-0 max-w-full overflow-x-auto">
                    <StoreFront/>
                </TabsContent>
                {!isTicketStore && <TabsContent value="localization" className="mt-4 min-w-0 max-w-full overflow-x-auto">
                    <LocalizationSettings onManageBranches={() => {
                        setTab('store')
                        window.setTimeout(() => document.getElementById('branch-pickup-locations')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
                    }}/>
                </TabsContent>}
                <TabsContent value="finance" className="mt-4 min-w-0 max-w-full overflow-x-auto">
                    <Finance/>
                </TabsContent>
                <TabsContent value="notification" className="mt-4 min-w-0 max-w-full overflow-x-auto">
                    <Notification/>
                </TabsContent>
                <TabsContent value="support" className="min-w-0 max-w-full overflow-x-auto">
                    <Support/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SettingsTabs
