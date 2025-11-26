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
                // Add default startDate parameter as required by the API
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                const queryParams = new URLSearchParams({ startDate });
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
                console.log(`📊 Processing metric ${metric.id}:`, data.ordersOverview);

                let currentValue: string | number = "0";
                let changePercent = 0;

                // Extract the correct value for each specific metric
                switch (metric.id) {
                    case "total-orders":
                        currentValue = data.ordersOverview?.total_orders || "0";
                        changePercent = parseFloat(data.ordersOverview?.total_orders_percent_from_last_month || "0");
                        break;
                    case "pending-orders":
                        currentValue = data.ordersOverview?.pending_orders || "0";
                        changePercent = parseFloat(data.ordersOverview?.pending_orders_percent_from_last_month || "0");
                        break;
                    case "cancelled-orders":
                        currentValue = data.ordersOverview?.cancelled_orders || "0";
                        changePercent = parseFloat(data.ordersOverview?.cancelled_orders_percent_from_last_month || "0");
                        break;
                    case "fulfilled-orders":
                        currentValue = data.ordersOverview?.fulfilled_orders || "0";
                        changePercent = parseFloat(data.ordersOverview?.fulfilled_orders_percent_from_last_month || "0");
                        break;
                    default:
                        currentValue = "0";
                        changePercent = 0;
                }

                console.log(`📊 Final values for ${metric.id}:`, { currentValue, changePercent });

                // Format the value
                const formattedValue = currentValue.toString();

                setValue(formattedValue);
                setChange(Math.round(Math.abs(changePercent) * 10) / 10);
                setChangeType(changePercent >= 0 ? "positive" : "negative");
            } catch (err) {
                console.error("Client-side: Fetch error:", err);
                setError("Failed to load metric");
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