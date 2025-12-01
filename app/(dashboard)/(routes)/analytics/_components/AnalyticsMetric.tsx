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
    title2: string;
    value2: string | number;
}

interface MetricCardProps {
    metric: OverviewMetric;
    startDate: string; 
    endDate: string;
}

export function AnalyticsMetric({ metric,startDate, endDate }: MetricCardProps) {
    const [value, setValue] = useState<string | number>(metric.value);
    const [change, setChange] = useState<number>(metric.change);
    const [changeType, setChangeType] = useState<"positive" | "negative">(metric.changeType);
    const [title2, setTitle2] = useState<string>(metric.title2);
    const [value2, setValue2] = useState<string | number>(metric.value2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Add default startDate parameter as required by the API
                const queryParams = new URLSearchParams({ 
                    startDate, 
                    endDate 
                });
                const url = `/api/analytics?${queryParams}`;
                
                const res = await fetch(url, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.message || 'Failed to fetch analytics data');
                }

                const data = result.data;
                console.log(`📊 Processing metric ${metric.id}:`, data);

                let currentValue: string | number = "0";
                let changePercent = 0;
                const currentTitle2 = metric.title2;
                let currentValue2: string | number = metric.value2;

                // Extract the correct value for each specific metric
                switch (metric.id) {
                    case "total-revenue":
                        currentValue = data.totalRevenue || "0";
                        changePercent = 0; // Not provided in API
                        break;
                    case "processed-orders":
                        currentValue = data.processedOrders || "0";
                        changePercent = 0; // Not provided in API
                        break;
                    case "out-for-delivery":
                        currentValue = data.outForDelivery || 0;
                        changePercent = 0; // Not provided in API
                        break;
                    case "total-views":
                        currentValue = data.totalViews || 0;
                        changePercent = 0; // Not provided in API
                        break;
                    case "avg-order-value":
                        currentValue = data.avgOrderValue || "0";
                        changePercent = 0; // Not provided in API
                        break;
                    case "total-orders":
                        currentValue = data.ordersOverview?.total_orders || "0";
                        changePercent = parseFloat(data.ordersOverview?.total_orders_percent_from_last_month || "0");
                        currentValue2 = data.customerAnalytics?.avg_items_per_order || "0";
                        break;
                    default:
                        currentValue = "0";
                        changePercent = 0;
                }

                console.log(`📊 Final values for ${metric.id}:`, { 
                    currentValue, 
                    changePercent,
                    currentTitle2,
                    currentValue2 
                });

                // Format the value
                let formattedValue: string;
                if (typeof currentValue === "string") {
                    // Handle currency formatting for revenue
                    if (["total-revenue", "avg-order-value"].includes(metric.id)) {
                        const numValue = parseFloat(currentValue) || 0;
                        formattedValue = `₦${numValue.toLocaleString("en-NG")}`;
                    } else {
                        formattedValue = currentValue;
                    }
                } else {
                    // Handle number values
                    if (["total-revenue", "avg-order-value"].includes(metric.id)) {
                        formattedValue = `₦${currentValue.toLocaleString("en-NG")}`;
                    } else {
                        formattedValue = currentValue.toLocaleString();
                    }
                }

                // Format value2 if it's a number with decimals
                let formattedValue2: string;
                if (typeof currentValue2 === "string" && currentValue2.includes(".")) {
                    // Format decimal numbers to show only 1-2 decimal places
                    const numValue = parseFloat(currentValue2);
                    formattedValue2 = numValue.toFixed(1);
                } else {
                    formattedValue2 = currentValue2.toString();
                }

                setValue(formattedValue);
                setChange(Math.round(Math.abs(changePercent) * 10) / 10);
                setChangeType(changePercent >= 0 ? "positive" : "negative");
                setTitle2(currentTitle2);
                setValue2(formattedValue2);
            } catch (err) {
                console.error("Client-side: Fetch error:", err);
                setError("Failed to load metric");
                setValue(metric.value);
                setChange(metric.change);
                setChangeType(metric.changeType);
                setTitle2(metric.title2);
                setValue2(metric.value2);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [metric.id, metric.value, metric.change, metric.changeType, metric.title2, metric.value2,startDate, endDate]);

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
                            className={`text-xs rounded-full ${changeType === "positive"
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
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[#A0A0A0]">{title2}</span>  
                 <span className="text-xs text-[#A0A0A0]"> {value2}</span>  
                </div>
            </CardContent>
        </Card>
    );
}