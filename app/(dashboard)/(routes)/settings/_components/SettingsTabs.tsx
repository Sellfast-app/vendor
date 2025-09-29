import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import React from 'react'
import AccountInformation from './AccountInformation'
import StoreFront from './StoreFront'
import Finance from './Finance'
import Notification from './Notification'
import Security from './Security'
import Support from './Support'

function SettingsTabs() {
    return (
        <div className="container mx-auto p-4">
            <Tabs defaultValue='account' className='w-full'>
            <TabsList className="w-full overflow-x-auto flex-nowrap justify-start scrollbar-hide">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="store">StoreFront Settings</TabsTrigger>
                    <TabsTrigger value="finance">Finance & Billings</TabsTrigger>
                    <TabsTrigger value="notification">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security & Access</TabsTrigger>
                    <TabsTrigger value="support">Support & Help</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className='mt-4'>
                    <AccountInformation/>
                </TabsContent>
                <TabsContent value="store" className='mt-4'>
                    <StoreFront/>
                </TabsContent>
                <TabsContent value="finance" className='mt-4'>
                    <Finance/>
                </TabsContent>
                <TabsContent value="notification" className='mt-4'>
                    <Notification/>
                </TabsContent>
                <TabsContent value='security'>
                    <Security/>
                </TabsContent>
                <TabsContent value='support'>
                    <Support/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SettingsTabs