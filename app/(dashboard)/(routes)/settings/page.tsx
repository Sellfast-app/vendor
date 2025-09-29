import { Input } from '@/components/ui/input'
import { SearchIcon } from 'lucide-react'
import React from 'react'
import SettingsTabs from './_components/SettingsTabs'

export default function SettingsPage() {
  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
      <h3 className="text-sm font-bold">Account Information</h3>
      <div className='relative'>
        <Input type="text" placeholder="Search Settings..." className="mb-2"/>
        <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      </div>
      <SettingsTabs/>
      </div>
  )
}
