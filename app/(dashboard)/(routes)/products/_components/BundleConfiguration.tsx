"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, CirclePlus, Pencil, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BundleSlot } from './AddFoodModal';

interface BundleAddOnOption {
    id: string;
    name: string;
    price: string;
}

export interface BundleAddOnGroup {
    id: string;
    groupName: string;
    selection: 'single' | 'multiple';
    maxSelections: number;
    isRequired: boolean;
    options: BundleAddOnOption[];
    draftOptionName: string;
    draftOptionPrice: string;
}
interface BundleConfigurationProps {
    slots: BundleSlot[];
    onSlotsChange: (slots: BundleSlot[]) => void;
    addOnGroups: BundleAddOnGroup[];
    onAddOnGroupsChange: (groups: BundleAddOnGroup[] | ((prev: BundleAddOnGroup[]) => BundleAddOnGroup[])) => void;
}

function BundleSlotRow({ slot, onRemove, onEdit }: { slot: BundleSlot; onRemove: (id: string) => void; onEdit: (id: string) => void }) {
    return (
        <div className="flex items-center justify-between py-2 px-1 border-b border-[#F0F0F0] last:border-0">
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{slot.name}</span>
                <span className="text-xs text-[#A0A0A0]">
                    {slot.category} &nbsp;·&nbsp; {slot.maxItems} Items &nbsp;·&nbsp; ₦{parseFloat(slot.price || '0').toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onEdit(slot.id)} className="text-primary hover:text-primary-secondary transition-colors" type="button"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => onRemove(slot.id)} className="text-red-400 hover:text-red-600 transition-colors" type="button"><Trash2 className="w-4 h-4" /></button>
            </div>
        </div>
    );
}

function AddOnGroupCard({ group, onChange, onRemove, onAddOption, onRemoveOption }: {
    group: BundleAddOnGroup; onChange: (id: string, field: keyof BundleAddOnGroup, value: unknown) => void;
    onRemove: (id: string) => void; onAddOption: (groupId: string) => void; onRemoveOption: (groupId: string, optionId: string) => void;
}) {
    return (
        <div className="border border-dashed border-primary rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Add-On Group</h4>
                <button onClick={() => onRemove(group.id)} type="button" className="text-[#A0A0A0] hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="mb-3">
                <Label className="text-xs font-light mb-1">Group Name<span className="text-destructive">*</span></Label>
                <Input value={group.groupName} onChange={(e) => onChange(group.id, 'groupName', e.target.value)} placeholder="e.g. Proteins, Drinks, Carbs" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <Label className="text-xs font-light mb-1">Selection<span className="text-destructive">*</span></Label>
                    <Select value={group.selection} onValueChange={(v) => onChange(group.id, 'selection', v as 'single' | 'multiple')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="single">Single Choice</SelectItem>
                            <SelectItem value="multiple">Multiple Choice</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-xs font-light mb-1">Max Selections<span className="text-destructive">*</span></Label>
                    <Input type="number" min={1} value={group.maxSelections} onChange={(e) => onChange(group.id, 'maxSelections', parseInt(e.target.value) || 1)} />
                </div>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
                <Label className="text-xs font-light">Is this required?</Label>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id={`required-${group.id}`} checked={group.isRequired} onChange={(e) => onChange(group.id, 'isRequired', e.target.checked)} className="w-3.5 h-3.5 accent-primary cursor-pointer" />
                    <Label htmlFor={`required-${group.id}`} className="text-xs font-medium cursor-pointer">Yes, customers must select</Label>
                </div>
            </div>
            <div className="border-t border-[#F0F0F0] pt-3">
                <h5 className="text-xs font-semibold mb-3">Add-on Options</h5>
                <div className="mb-3">
                    <Label className="text-xs font-light mb-1">Option Name<span className="text-destructive">*</span></Label>
                    <Input value={group.draftOptionName} onChange={(e) => onChange(group.id, 'draftOptionName', e.target.value)} placeholder="e.g. Extra Chicken" className="mb-2" />
                    <Label className="text-xs font-light mb-1">Add-on Price<span className="text-destructive">*</span></Label>
                    <div className="flex items-center gap-1 border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                        <span className="px-2 text-sm text-[#A0A0A0] select-none">₦</span>
                        <input type="number" min={0} step="0.01" value={group.draftOptionPrice} onChange={(e) => onChange(group.id, 'draftOptionPrice', e.target.value)} placeholder="0.00" className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent" />
                    </div>
                </div>
                <Button type="button" size="sm" variant="outline" className="text-xs mb-3" onClick={() => onAddOption(group.id)}>+ Add Option</Button>
                {group.options.length > 0 && (
                    <div className="space-y-1">
                        {group.options.map((opt) => (
                            <div key={opt.id} className="flex items-center justify-between py-1.5 border-b border-[#F0F0F0] last:border-0">
                                <span className="text-sm">{opt.name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">₦{parseFloat(opt.price || '0').toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                    <button type="button" onClick={() => onRemoveOption(group.id, opt.id)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BundleConfiguration({ slots, onSlotsChange ,  addOnGroups,onAddOnGroupsChange }: BundleConfigurationProps) {
    const [bundleName, setBundleName] = useState('');
    const [bundlePrice, setBundlePrice] = useState('');
    const [bundleCategory, setBundleCategory] = useState('');
    const [maxItems, setMaxItems] = useState<number>(2);
    const [isSlotRequired, setIsSlotRequired] = useState(false);
    const [bundleOpen, setBundleOpen] = useState(true);
    const [customizationEnabled, setCustomizationEnabled] = useState(false);

    useEffect(() => {
        if (addOnGroups.length > 0) {
            setCustomizationEnabled(true);
        }
    }, [addOnGroups.length]);

    const handleAddSlot = () => {
        if (!bundleName.trim() || !bundleCategory) return;
        onSlotsChange([...slots, {
            id: Math.random().toString(36).substr(2, 9),
            name: bundleName, price: bundlePrice, category: bundleCategory, maxItems, isRequired: isSlotRequired,
        }]);
        setBundleName(''); setBundlePrice(''); setBundleCategory(''); setMaxItems(2); setIsSlotRequired(false);
    };

    const handleRemoveSlot = (id: string) => onSlotsChange(slots.filter((s) => s.id !== id));

    const handleEditSlot = (id: string) => {
        const slot = slots.find((s) => s.id === id);
        if (!slot) return;
        setBundleName(slot.name); setBundlePrice(slot.price); setBundleCategory(slot.category);
        setMaxItems(slot.maxItems); setIsSlotRequired(slot.isRequired);
        onSlotsChange(slots.filter((s) => s.id !== id));
    };

    const handleAddGroup = () => {
        onAddOnGroupsChange((prev) => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            groupName: '', selection: 'single', maxSelections: 2, isRequired: false,
            options: [], draftOptionName: '', draftOptionPrice: '',
        }]);
    };

    const handleGroupChange = (id: string, field: keyof BundleAddOnGroup, value: unknown) => {
        onAddOnGroupsChange((prev) => prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
    };

    const handleRemoveGroup = (id: string) => onAddOnGroupsChange((prev) => prev.filter((g) => g.id !== id));

    const handleAddOption = (groupId: string) => {
        onAddOnGroupsChange((prev) => prev.map((g) => {
            if (g.id !== groupId || !g.draftOptionName.trim()) return g;
            return { ...g, options: [...g.options, { id: Math.random().toString(36).substr(2, 9), name: g.draftOptionName, price: g.draftOptionPrice }], draftOptionName: '', draftOptionPrice: '' };
        }));
    };

    const handleRemoveOption = (groupId: string, optionId: string) => {
        onAddOnGroupsChange((prev) => prev.map((g) => g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g));
    };

    return (
        <div className="mt-4 space-y-4">
            <div className="overflow-hidden">
                <button type="button" onClick={() => setBundleOpen((v) => !v)} className="w-full flex items-start justify-between text-left">
                    <div>
                        <h3 className="text-sm font-semibold">Bundle Configuration</h3>
                        <p className="text-xs text-[#A0A0A0] mt-0.5">Define what customers can include in this package.</p>
                    </div>
                    {bundleOpen ? <ChevronUp className="w-4 h-4 text-[#A0A0A0] mt-0.5 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#A0A0A0] mt-0.5 flex-shrink-0" />}
                </button>

                {bundleOpen && (
                    <div className="pb-4">
                        <div className="border border-dashed border-primary rounded-lg p-4 mt-4 space-y-3">
                            <div>
                                <Label className="text-xs font-light mb-1">Bundle Name<span className="text-destructive">*</span></Label>
                                <Input value={bundleName} onChange={(e) => setBundleName(e.target.value)} placeholder="e.g. Main Dish" />
                            </div>
                            <div>
                                <Label className="text-xs font-light mb-1">Bundle Price<span className="text-destructive">*</span></Label>
                                <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                    <span className="px-2 text-sm text-[#A0A0A0] select-none">₦</span>
                                    <input type="number" min={0} step="0.01" value={bundlePrice} onChange={(e) => setBundlePrice(e.target.value)} placeholder="0.00" className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs font-light mb-1">Category<span className="text-destructive">*</span></Label>
                                    <Select value={bundleCategory} onValueChange={setBundleCategory}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Rice Dishes">Rice Dishes</SelectItem>
                                            <SelectItem value="Snacks">Snacks</SelectItem>
                                            <SelectItem value="Drinks">Drinks</SelectItem>
                                            <SelectItem value="Desserts">Desserts</SelectItem>
                                            <SelectItem value="Fruity Desserts">Fruity Desserts</SelectItem>
                                            <SelectItem value="Custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-light mb-1">Max Items Allowed<span className="text-destructive">*</span></Label>
                                    <Input type="number" min={1} value={maxItems} onChange={(e) => setMaxItems(parseInt(e.target.value) || 1)} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-light">Is this required?</Label>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="slot-required" checked={isSlotRequired} onChange={(e) => setIsSlotRequired(e.target.checked)} className="w-3.5 h-3.5 accent-primary cursor-pointer" />
                                    <Label htmlFor="slot-required" className="text-xs font-medium cursor-pointer">Yes, customers must select</Label>
                                </div>
                            </div>
                        </div>

                        <Button type="button" variant="outline" size="sm" className="mt-3 text-xs flex items-center gap-1.5" onClick={handleAddSlot}>
                            <CirclePlus className="w-3.5 h-3.5" /> Add Item Slot
                        </Button>

                        {slots.length > 0 && (
                            <div className="mt-4 border border-[#F0F0F0] rounded-lg px-3 pt-1 pb-0">
                                {slots.map((slot) => (
                                    <BundleSlotRow key={slot.id} slot={slot} onRemove={handleRemoveSlot} onEdit={handleEditSlot} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="overflow-hidden">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-semibold">Customization Options</h3>
                        <p className="text-xs text-[#A0A0A0] mt-0.5">Add extras customers can select when ordering.</p>
                    </div>
                    <input type="checkbox" checked={customizationEnabled} onChange={(e) => setCustomizationEnabled(e.target.checked)} className="w-4 h-4 accent-primary mt-1 cursor-pointer" />
                </div>

                {customizationEnabled && (
                    <div className="pb-4">
                        <div className="mt-4">
                            {addOnGroups.map((group) => (
                                <AddOnGroupCard key={group.id} group={group} onChange={handleGroupChange} onRemove={handleRemoveGroup} onAddOption={handleAddOption} onRemoveOption={handleRemoveOption} />
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="text-xs flex items-center gap-1.5" onClick={handleAddGroup}>
                            <CirclePlus className="w-3.5 h-3.5" /> Add Customization Group
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
