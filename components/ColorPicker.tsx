"use client";

import { X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ColorPickerPopupProps {
    isOpen: boolean;
    onClose: () => void;
    selectedColor: string;
    onColorChange: (color: string) => void;
}

export function ColorPickerPopup({ isOpen, onClose, selectedColor, onColorChange }: ColorPickerPopupProps) {
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [lightness, setLightness] = useState(50);
    const [hexValue, setHexValue] = useState(selectedColor);
    const [opacity, setOpacity] = useState(100);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // Convert hex to HSL on mount and when selectedColor changes
    useEffect(() => {
        if (selectedColor) {
            const hsl = hexToHSL(selectedColor);
            setHue(hsl.h);
            setSaturation(hsl.s);
            setLightness(hsl.l);
            setHexValue(selectedColor);
        }
    }, [selectedColor]);

    // Draw color palette
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Draw saturation-lightness gradient
        for (let row = 0; row < height; row++) {
            const l = (row / height) * 100;
            for (let col = 0; col < width; col++) {
                const s = (col / width) * 100;
                ctx.fillStyle = `hsl(${hue}, ${s}%, ${l}%)`;
                ctx.fillRect(col, row, 1, 1);
            }
        }
    }, [hue]);

    // Convert HSL to Hex
    function hslToHex(h: number, s: number, l: number): string {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
    }

    // Convert Hex to HSL
    function hexToHSL(hex: string): { h: number; s: number; l: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return { h: 0, s: 100, l: 50 };

        const r = parseInt(result[1], 16) / 255;
        const g = parseInt(result[2], 16) / 255;
        const b = parseInt(result[3], 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    // Update color from canvas click
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const s = (x / canvas.width) * 100;
        const l = (y / canvas.height) * 100;

        setSaturation(s);
        setLightness(l);
        updateColor(hue, s, l);
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isSelecting) return;
        handleCanvasClick(e);
    };

    // Update color
    const updateColor = (h: number, s: number, l: number) => {
        const hex = hslToHex(h, s, l);
        setHexValue(hex);
        onColorChange(hex);
    };

    // Handle hue slider change
    const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHue = parseFloat(e.target.value);
        setHue(newHue);
        updateColor(newHue, saturation, lightness);
    };

    // Handle opacity slider change
    const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOpacity(parseFloat(e.target.value));
    };

    // Handle hex input change
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        setHexValue(value);

        // Validate hex
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            const hsl = hexToHSL(value);
            setHue(hsl.h);
            setSaturation(hsl.s);
            setLightness(hsl.l);
            onColorChange(value);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/20" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#1A1A1A] rounded-lg shadow-xl p-4 w-[280px] z-[101]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Color Picker</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Color Palette Canvas */}
                <div className="mb-4 relative">
                    <canvas
                        ref={canvasRef}
                        width={248}
                        height={200}
                        className="w-full rounded cursor-crosshair border border-gray-200 dark:border-gray-700"
                        onClick={handleCanvasClick}
                        onMouseDown={() => setIsSelecting(true)}
                        onMouseUp={() => setIsSelecting(false)}
                        onMouseLeave={() => setIsSelecting(false)}
                        onMouseMove={handleCanvasMouseMove}
                    />
                    {/* Color selector indicator */}
                    <div
                        className="absolute w-5 h-5 border-2 border-white rounded-full pointer-events-none shadow-lg"
                        style={{
                            left: `${(saturation / 100) * 248}px`,
                            top: `${(lightness / 100) * 200}px`,
                            transform: 'translate(-50%, -50%)',
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)'
                        }}
                    />
                </div>

                {/* Eyedropper Icon (optional - can add functionality later) */}
                <div className="mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600 dark:text-gray-400">
                        <path d="M19.78 2.22a.75.75 0 0 1 0 1.06l-1.97 1.97 2.47 2.47a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0l-2.47-2.47-8.03 8.03a2.25 2.25 0 0 1-3.18-3.18l8.03-8.03-2.47-2.47a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 0l2.47 2.47 1.97-1.97a.75.75 0 0 1 1.06 0l1.06 1.06z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>

                {/* Hue Slider */}
                <div className="mb-3">
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={hue}
                        onChange={handleHueChange}
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer hue-slider"
                        style={{
                            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                        }}
                    />
                </div>

                {/* Opacity Slider */}
                <div className="mb-4">
                    <div className="relative">
                        <div 
                            className="absolute inset-0 rounded-lg opacity-30"
                            style={{
                                backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                                backgroundSize: '10px 10px',
                                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                            }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={opacity}
                            onChange={handleOpacityChange}
                            className="relative w-full h-3 rounded-lg appearance-none cursor-pointer opacity-slider"
                            style={{
                                background: `linear-gradient(to right, transparent 0%, ${hexValue} 100%)`
                            }}
                        />
                    </div>
                </div>

                {/* Hex Input and Opacity Value */}
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-10">Hex</span>
                            <Input
                                type="text"
                                value={hexValue}
                                onChange={handleHexChange}
                                className="flex-1 h-8 text-xs font-mono uppercase"
                                maxLength={7}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Input
                            type="number"
                            value={Math.round(opacity)}
                            onChange={(e) => setOpacity(parseFloat(e.target.value) || 0)}
                            className="w-14 h-8 text-xs text-center"
                            min="0"
                            max="100"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .hue-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #ddd;
                    cursor: pointer;
                    box-shadow: 0 0 2px rgba(0,0,0,0.5);
                }

                .hue-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #ddd;
                    cursor: pointer;
                    box-shadow: 0 0 2px rgba(0,0,0,0.5);
                }

                .opacity-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #ddd;
                    cursor: pointer;
                    box-shadow: 0 0 2px rgba(0,0,0,0.5);
                }

                .opacity-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #ddd;
                    cursor: pointer;
                    box-shadow: 0 0 2px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
}