"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { JSX, useState, useEffect } from "react";

interface OverviewMetric {
    id: string;
    icon1: JSX.Element;
    title: string;
    value: string | number;
    change: number;
    changeType: "positive" | "negative";
    icon2: JSX.Element;
}

interface MetricCardProps {
    metric: OverviewMetric;
}

export function OverviewMetric({ metric }: MetricCardProps) {
    const [value, setValue] = useState<string | number>(metric.value);
    const [change, setChange] = useState<number>(metric.change);
    const [changeType, setChangeType] = useState<"positive" | "negative">(metric.changeType);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Use the new stores overview endpoint
                const url = `/api/store/overview`;
                console.log(`📊 Fetching store overview for metric: ${metric.id}`);
                
                const res = await fetch(url, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                
                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.message || 'Failed to fetch store overview data');
                }

                if (result.status !== 'success') {
                    throw new Error(result.message || 'API returned error status');
                }

                const data = result.data;
                console.log(`📊 Processing metric ${metric.id}:`, data);

                let currentValue: string | number = "0";
                let changePercent = 0;

                // Extract the correct value for each specific metric from the new endpoint
                switch (metric.id) {
                    case "total-products":
                        currentValue = data.total_products || 0;
                        changePercent = 0; // Not provided in this endpoint for products
                        break;
                    
                    case "low-stock":
                        currentValue = data.low_stock || 0;
                        changePercent = 0; // Not provided in this endpoint for low stock
                        break;
                    
                    case "total-orders":
                        currentValue = data.total_orders || 0;
                        changePercent = parseFloat(data.total_orders_percent_from_last_month || "0");
                        break;
                    
                    case "total-revenue":
                        currentValue = data.total_revenue || "0";
                        changePercent = parseFloat(data.total_revenue_percent_from_last_month || "0");
                        break;
                    
                    default:
                        currentValue = "0";
                        changePercent = 0;
                }

                console.log(`📊 Final values for ${metric.id}:`, { 
                    currentValue, 
                    changePercent 
                });

                // Format the value based on metric type
                let formattedValue: string;
                if (typeof currentValue === "string") {
                    // Handle currency formatting for revenue
                    if (["total-revenue"].includes(metric.id)) {
                        const numValue = parseFloat(currentValue) || 0;
                        formattedValue = `₦${numValue.toLocaleString("en-NG")}`;
                    } else {
                        formattedValue = currentValue;
                    }
                } else {
                    // Handle number values
                    if (["total-revenue"].includes(metric.id)) {
                        formattedValue = `₦${currentValue.toLocaleString("en-NG")}`;
                    } else {
                        formattedValue = currentValue.toLocaleString();
                    }
                }

                setValue(formattedValue);
                setChange(Math.round(Math.abs(changePercent) * 10) / 10);
                setChangeType(changePercent >= 0 ? "positive" : "negative");
                
            } catch (err) {
                console.error("Client-side: Fetch error:", err);
                setError("Failed to load metric");
                // Fallback to default values
                setValue(metric.value);
                setChange(metric.change);
                setChangeType(metric.changeType);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [metric.id, metric.value, metric.change, metric.changeType]);

    return (
        <Card className="relative shadow-none hover:border-[#4FCA6A] dark:hover:border-[#4FCA6A] hover:shadow-lg hover:shadow-[#005B1414] border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium flex justify-between items-center gap-1 w-full">
                    <p> {metric.title}</p>
                    <span>{metric.icon1}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div className="flex-col items-center justify-center relative">
                    {loading ? (
                        <div className="text-xl font-medium flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2 text-red-500" />
                        </div>
                    ) : error ? (
                        <div className="text-xl font-medium text-red-500">{error}</div>
                    ) : (
                        <div className="text-xl font-medium">
                            {typeof value === "number" ? value.toLocaleString() : value}
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <Badge
                            variant={changeType === "positive" ? "default" : "destructive"}
                            className={`text-sm rounded-full ${changeType === "positive"
                                    ? "bg-card text-green-700 "
                                    : "bg-card text-red-700 "
                                }`}
                        >
                            {changeType === "positive" ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {change}%
                        </Badge>
                    </div>
                </div>
                <div className="">
                    {metric.icon2}
                </div>
            </CardContent>
        </Card>
    );
}