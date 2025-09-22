"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  Loader2 } from "lucide-react";

import { JSX, useState } from "react";


interface OverviewMetric {
    id: string;
    icon1: JSX.Element;
    title: string;
    value: string | number;
}

interface MetricCardProps {
    metric: OverviewMetric;
}

export function Payoutmetrics({ metric }: MetricCardProps) {
    const [value,] = useState<string | number>(metric.value);
    const [loading,] = useState(false);
    const [error,] = useState<string | null>(null);



    // const fetchMetric = async (
    //   endpoint: string,
    //   startDate: string,
    //   endDate: string
    // ) => {
    //   const query = new URLSearchParams({ startDate, endDate });
    //   const url = `${endpoint}?${query.toString()}`;
    //   const res = await fetch(url, {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json" },
    //   });
    //   const data = await res.json();

    //   // Accept both number and string, as some APIs might return formatted string
    //   if (res.ok && data.status && (typeof data.data === "number" || typeof data.data === "string")) {
    //     return data.data;
    //   } else {
    //     throw new Error(data.message || `Failed to fetch metric from ${endpoint}`);
    //   }
    // };

    //   useEffect(() => {
    //     const supported = {
    //       "generated-vnubans": "/api/analytics/vnuban/total",
    //       "processed-transactions": "/api/analytics/transactions/successful-volume",
    //       "active-vnubans": "/api/analytics/vnuban/total-dynamic"
    //     };

    //     if (!Object.keys(supported).includes(metric.id)) {
    //       setValue(metric.value);
    //       setChange(metric.change);
    //       setChangeType(metric.changeType);
    //       return;
    //     }

    //     const fetchData = async () => {
    //       setLoading(true);
    //       setError(null);

    //       try {
    //         const { startDate, endDate } = getDateRange(period);
    //         const { startDate: prevStart, endDate: prevEnd } = adjustPreviousPeriod(
    //           startDate,
    //           endDate
    //         );

    //         const url = supported[metric.id as keyof typeof supported];
    //         // Always use current response data for value
    //         const current = await fetchMetric(url, startDate, endDate);
    //         const previous = await fetchMetric(url, prevStart, prevEnd);

    //         // If backend returns the display string, just show it. Else, format as currency or number.
    //         let formattedValue: string;
    //         if (typeof current === "string") {
    //           formattedValue = current;
    //         } else if (["processed-transactions", "successful-amount", "payouts-processed"].includes(metric.id)) {
    //           formattedValue = `₦${current.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
    //         } else {
    //           formattedValue = current.toLocaleString("en-NG");
    //         }

    //         const changePercent =
    //           previous && Number(previous) !== 0
    //             ? ((Number(current) - Number(previous)) / Math.abs(Number(previous))) * 100
    //             : 0;

    //         setValue(formattedValue);
    //         setChange(Math.round(Math.abs(changePercent) * 10) / 10);
    //         setChangeType(changePercent >= 0 ? "positive" : "negative");
    //       } catch (err) {
    //         console.error("Client-side: Fetch error:", err);
    //         setError("Failed to load metric");
    //         setValue("₦0.00");
    //         setChange(0);
    //         setChangeType("positive");
    //       } finally {
    //         setLoading(false);
    //       }
    //     };

    //     fetchData();
    //   }, [metric.id, period]);

    return (
        <Card className="relative shadow-none hover:border-[#4FCA6A] hover:shadow-lg hover:shadow-[#005B1414] border-[#F5F5F5] dark:border-[#1F1F1F]">
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
                </div>
                <div className="flex flex-col items-end">
                  {/* <span className="text-xs text-[#A0A0A0]">{metric.title2}</span>   */}
                 {/* <span className="text-xs text-[#A0A0A0]"> {metric.value2}</span>   */}
                </div>
            </CardContent>
        </Card>
    );
}