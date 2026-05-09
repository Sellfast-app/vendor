"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp, CirclePlus, Pencil, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface PortionSize {
    id: string;
    name: string;
    price: string;
    prepTimeStart: string;
    prepTimeEnd: string;
    servings: string;
    servingUnit: string;
}


function formatPortionRow(p: PortionSize) {
    const timeRange = `${p.prepTimeStart || 0} - ${p.prepTimeEnd || 0} mins`;
    const servings = `${p.servings || 0} servings/${p.servingUnit || 'plate'}`;
    const price = `₦${parseFloat(p.price || '0').toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
    return { timeRange, servings, price };
}


export default function PortionSetup() {
    const [isOpen, setIsOpen] = useState(true);

    // Draft form
    const [portionName, setPortionName] = useState('');
    const [portionPrice, setPortionPrice] = useState('');
    const [prepTimeStart, setPrepTimeStart] = useState('');
    const [prepTimeEnd, setPrepTimeEnd] = useState('');
    const [servings, setServings] = useState('');
    const [servingUnit, setServingUnit] = useState('plate');

    // Committed portions
    const [portions, setPortions] = useState<PortionSize[]>([]);

    const resetForm = () => {
        setPortionName('');
        setPortionPrice('');
        setPrepTimeStart('');
        setPrepTimeEnd('');
        setServings('');
        setServingUnit('plate');
    };

    const handleAdd = () => {
        if (!portionName.trim()) return;
        setPortions((prev) => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                name: portionName,
                price: portionPrice,
                prepTimeStart,
                prepTimeEnd,
                servings,
                servingUnit,
            },
        ]);
        resetForm();
    };

    const handleEdit = (id: string) => {
        const p = portions.find((p) => p.id === id);
        if (!p) return;
        setPortionName(p.name);
        setPortionPrice(p.price);
        setPrepTimeStart(p.prepTimeStart);
        setPrepTimeEnd(p.prepTimeEnd);
        setServings(p.servings);
        setServingUnit(p.servingUnit);
        setPortions((prev) => prev.filter((p) => p.id !== id));
    };

    const handleRemove = (id: string) => {
        setPortions((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="mt-4">
            {/* Header */}
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="w-full flex items-start justify-between text-left"
            >
                <div>
                    <h3 className="text-sm font-semibold">Portion Setup</h3>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-[#A0A0A0] mt-0.5 flex-shrink-0" />
                )}
            </button>

            {isOpen && (
                <div className="mt-3 space-y-3">
                    {/* Form card */}
                    <div className="border border-dashed border-[#4FCA6A] rounded-lg p-4 space-y-3">
                        {/* Portion Name */}
                        <div>
                            <Label className="text-xs font-light mb-1">
                                Portion Name<span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={portionName}
                                onChange={(e) => setPortionName(e.target.value)}
                                placeholder="e.g. Small, Regular, Large"
                            />
                        </div>

                        {/* Portion Price */}
                        <div>
                            <Label className="text-xs font-light mb-1">
                                Portion Price<span className="text-destructive">*</span>
                            </Label>
                            <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                <span className="px-2 text-sm text-[#A0A0A0] select-none">₦</span>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={portionPrice}
                                    onChange={(e) => setPortionPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent"
                                />
                            </div>
                        </div>

                        {/* Prep Time Start + Finish */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs font-light mb-1">
                                    Prep Time Start<span className="text-destructive">*</span>
                                </Label>
                                <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                    <span className="px-2 text-xs text-[#A0A0A0] select-none whitespace-nowrap">Mins</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={prepTimeStart}
                                        onChange={(e) => setPrepTimeStart(e.target.value)}
                                        placeholder="0"
                                        className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs font-light mb-1">
                                    Prep Time Finish<span className="text-destructive">*</span>
                                </Label>
                                <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                    <span className="px-2 text-xs text-[#A0A0A0] select-none whitespace-nowrap">Mins</span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={prepTimeEnd}
                                        onChange={(e) => setPrepTimeEnd(e.target.value)}
                                        placeholder="0"
                                        className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Serves */}
                        <div>
                            <Label className="text-xs font-light mb-1">
                                Serves <span className="text-[#A0A0A0]">(How many servings does this portion contain?)</span>
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                <Select value={servingUnit} onValueChange={setServingUnit}>
                                    <SelectTrigger className="border-0 border-r rounded-none w-auto px-2 shadow-none focus:ring-0 text-xs text-[#A0A0A0]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="plate">Plate</SelectItem>
                                        <SelectItem value="bowl">Bowl</SelectItem>
                                        <SelectItem value="wrap">Wrap</SelectItem>
                                        <SelectItem value="pack">Pack</SelectItem>
                                        <SelectItem value="box">Box</SelectItem>
                                        <SelectItem value="cup">Cup</SelectItem>
                                        <SelectItem value="portion">Portion</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input
                                    type="number"
                                    min={0}
                                    value={servings}
                                    onChange={(e) => setServings(e.target.value)}
                                    placeholder="0"
                                    className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Portion Size button */}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1.5"
                        onClick={handleAdd}
                    >
                        <CirclePlus className="w-3.5 h-3.5" />
                        Add Portion Size
                    </Button>

                    {/* Saved portions list */}
                    {portions.length > 0 && (
                        <div className="space-y-0">
                            {portions.map((p) => {
                                const { timeRange, servings: srv, price } = formatPortionRow(p);
                                return (
                                    <div
                                        key={p.id}
                                        className="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-0"
                                    >
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="text-sm font-medium">{p.name}</span>
                                            <span className="text-xs text-[#A0A0A0] truncate">
                                                {timeRange}&nbsp;&nbsp;{srv}&nbsp;&nbsp;{price}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(p.id)}
                                                className="text-[#4FCA6A] hover:text-green-700 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(p.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}