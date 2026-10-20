"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import AccountInformation from './AccountInformation'
import StoreFront from './StoreFront'
import Finance from './Finance'
import Notification from './Notification'
import Support from './Support'
import LocalizationSettings from './LocalizationSettings'

function SettingsTabs() {
    const [tab, setTab] = useState('account')
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.has('subscription_payment')) setTab('finance')
    }, [])
    return (
        <div className="container mx-auto p-4">
            <Tabs value={tab} onValueChange={setTab} className='w-full'>
            <TabsList className="w-full overflow-x-auto flex-nowrap justify-start scrollbar-hide">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="store">StoreFront Settings</TabsTrigger>
                    <TabsTrigger value="localization">Localization</TabsTrigger>
                    <TabsTrigger value="finance">Finance & Billings</TabsTrigger>
                    <TabsTrigger value="notification">Notifications</TabsTrigger>
                    <TabsTrigger value="support">Support & Help</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className='mt-4'>
                    <AccountInformation/>
                </TabsContent>
                <TabsContent value="store" className='mt-4'>
                    <StoreFront/>
                </TabsContent>
                <TabsContent value="localization" className='mt-4'>
                    <LocalizationSettings/>
                </TabsContent>
                <TabsContent value="finance" className='mt-4'>
                    <Finance/>
                </TabsContent>
                <TabsContent value="notification" className='mt-4'>
                    <Notification/>
                </TabsContent>
                <TabsContent value='support'>
                    <Support/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SettingsTabs
