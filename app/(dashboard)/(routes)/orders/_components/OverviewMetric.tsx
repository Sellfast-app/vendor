"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { JSX } from "react";

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
    return (
        <Card className="relative shadow-none hover:border-primary dark:hover:border-primary hover:shadow-lg hover:shadow-[#005B1414] border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium flex justify-between items-center gap-1 w-full">
                    <p> {metric.title}</p>
                    <span>{metric.icon1}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div className="flex-col items-center justify-center relative">
                    <div className="text-xl font-medium">
                        {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
                    </div>
                    <div className="flex items-center justify-between">
                        <Badge
                            variant={metric.changeType === "positive" ? "default" : "destructive"}
                            className={`text-sm rounded-full ${metric.changeType === "positive"
                                    ? "bg-card text-green-700 "
                                    : "bg-card text-red-700 "
                                }`}
                        >
                            {metric.changeType === "positive" ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {metric.change}%
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
