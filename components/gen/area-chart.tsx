"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A simple area chart"


const chartConfig = {
  units: {
    label: "units",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function GenAreaChart({ chartData}: {chartData: {
  month: string;
  units: number;
}[]}) {
  return (
      <Card>
        <CardHeader>
          <CardDescription>{chartData[0].month} - {chartData[chartData.length-1].month}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="units"
              type="natural"
              fill="var(--color-units)"
              fillOpacity={0.4}
              stroke="var(--color-units)"
            />
          </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
  )
}
