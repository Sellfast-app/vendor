"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, CirclePlus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { SavedGroup } from './AddFoodModal';

interface CustomizationOptionsProps {
    savedGroups: SavedGroup[];
    onChange: (groups: SavedGroup[]) => void;
}

export default function CustomizationOptions({ savedGroups, onChange }: CustomizationOptionsProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [groupName, setGroupName] = useState('');
    const [selection, setSelection] = useState<'single' | 'multiple'>('single');
    const [maxSelections, setMaxSelections] = useState<number>(2);
    const [isRequired, setIsRequired] = useState(false);
    const [optionName, setOptionName] = useState('');
    const [optionPrice, setOptionPrice] = useState('');

    const handleAddGroup = () => {
        if (!groupName.trim() || !optionName.trim()) return;
        const existing = savedGroups.find((g) => g.groupName === groupName);
        if (existing) {
            onChange(savedGroups.map((g) =>
                g.groupName === groupName
                    ? { ...g, options: [...g.options, { id: Math.random().toString(36).substr(2, 9), name: optionName, price: optionPrice }] }
                    : g
            ));
        } else {
            onChange([...savedGroups, {
                id: Math.random().toString(36).substr(2, 9),
                groupName, selection, maxSelections, isRequired,
                options: [{ id: Math.random().toString(36).substr(2, 9), name: optionName, price: optionPrice }],
            }]);
        }
        setOptionName('');
        setOptionPrice('');
    };

    const handleRemoveOption = (groupId: string, optionId: string) => {
        onChange(
            savedGroups
                .map((g) => g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g)
                .filter((g) => g.options.length > 0)
        );
    };

    return (
        <div className="mt-4">
            <button type="button" onClick={() => setIsOpen((v) => !v)} className="w-full flex items-start justify-between text-left">
                <div>
                    <h3 className="text-sm font-semibold">Customization Options</h3>
                    <p className="text-xs text-[#A0A0A0] mt-0.5">Add extras customers can select when ordering.</p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-[#A0A0A0] mt-0.5 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#A0A0A0] mt-0.5 flex-shrink-0" />}
            </button>

            {isOpen && (
                <div className="mt-4 space-y-4">
                    <div className="border border-dashed border-[#4FCA6A] rounded-lg p-4 space-y-3">
                        <h4 className="text-sm font-semibold">Add-On Group</h4>
                        <div>
                            <Label className="text-xs font-light mb-1">Group Name<span className="text-destructive">*</span></Label>
                            <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Proteins, Drinks, Carbs" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-light mb-1">Selection<span className="text-destructive">*</span></Label>
                                <Select value={selection} onValueChange={(v) => setSelection(v as 'single' | 'multiple')}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="single">Single Choice</SelectItem>
                                        <SelectItem value="multiple">Multiple Choice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs font-light mb-1">Max Selections<span className="text-destructive">*</span></Label>
                                <Input type="number" min={1} value={maxSelections} onChange={(e) => setMaxSelections(parseInt(e.target.value) || 1)} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-light">Is this required?<span className="text-destructive">*</span></Label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="customization-required" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} className="w-3.5 h-3.5 accent-[#4FCA6A] cursor-pointer" />
                                <Label htmlFor="customization-required" className="text-xs font-medium cursor-pointer">Yes, customers must select</Label>
                            </div>
                        </div>
                        <div className="border-t border-[#F0F0F0] pt-3 space-y-3">
                            <h5 className="text-xs font-semibold">Add-on Options</h5>
                            <div>
                                <Label className="text-xs font-light mb-1">Option Name<span className="text-destructive">*</span></Label>
                                <Input value={optionName} onChange={(e) => setOptionName(e.target.value)} placeholder="e.g. Extra Chicken" />
                            </div>
                            <div>
                                <Label className="text-xs font-light mb-1">Add-on Price<span className="text-destructive">*</span></Label>
                                <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                    <span className="px-2 text-sm text-[#A0A0A0] select-none">₦</span>
                                    <input type="number" min={0} step="0.01" value={optionPrice} onChange={(e) => setOptionPrice(e.target.value)} placeholder="0.00" className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button type="button" variant="outline" size="sm" className="text-xs flex items-center gap-1.5" onClick={handleAddGroup}>
                        <CirclePlus className="w-3.5 h-3.5" /> Add Customization Group
                    </Button>

                    {savedGroups.length > 0 && (
                        <div className="space-y-3 mt-2">
                            {savedGroups.map((group) => (
                                <div key={group.id}>
                                    <p className="text-xs text-[#A0A0A0] flex items-center gap-1.5 mb-1">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                                            <circle cx="6" cy="6" r="5" stroke="#A0A0A0" strokeWidth="1.2" />
                                            <circle cx="6" cy="6" r="2" fill="#A0A0A0" />
                                        </svg>
                                        {group.groupName}
                                    </p>
                                    {group.options.map((opt) => (
                                        <div key={opt.id} className="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-0 pl-1">
                                            <span className="text-sm">{opt.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">₦{parseFloat(opt.price || '0').toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                                <button type="button" onClick={() => handleRemoveOption(group.id, opt.id)} className="text-red-400 hover:text-red-600 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}