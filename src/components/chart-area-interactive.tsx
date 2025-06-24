"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"

import { useIsMobile } from "~/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/components/ui/toggle-group"

export const description = "An interactive area chart for TCG Vision"

interface ChartDataPoint {
  date: string;
  sales: number;
  scans: number;
}

interface ChartAreaInteractiveProps {
  data?: ChartDataPoint[];
}

const defaultChartData: ChartDataPoint[] = [
  { date: "2024-04-01", sales: 22, scans: 15 },
  { date: "2024-04-02", sales: 9, scans: 18 },
  { date: "2024-04-03", sales: 16, scans: 12 },
  { date: "2024-04-04", sales: 24, scans: 26 },
  { date: "2024-04-05", sales: 37, scans: 29 },
  { date: "2024-04-06", sales: 30, scans: 34 },
  { date: "2024-04-07", sales: 24, scans: 18 },
  { date: "2024-04-08", sales: 40, scans: 32 },
  { date: "2024-04-09", sales: 5, scans: 11 },
  { date: "2024-04-10", sales: 26, scans: 19 },
  { date: "2024-04-11", sales: 32, scans: 35 },
  { date: "2024-04-12", sales: 29, scans: 21 },
  { date: "2024-04-13", sales: 34, scans: 38 },
  { date: "2024-04-14", sales: 13, scans: 22 },
  { date: "2024-04-15", sales: 12, scans: 17 },
  { date: "2024-04-16", sales: 13, scans: 19 },
  { date: "2024-04-17", sales: 44, scans: 36 },
  { date: "2024-04-18", sales: 36, scans: 41 },
  { date: "2024-04-19", sales: 24, scans: 18 },
  { date: "2024-04-20", sales: 8, scans: 15 },
  { date: "2024-04-21", sales: 13, scans: 20 },
  { date: "2024-04-22", sales: 22, scans: 17 },
  { date: "2024-04-23", sales: 13, scans: 23 },
  { date: "2024-04-24", sales: 38, scans: 29 },
  { date: "2024-04-25", sales: 21, scans: 25 },
  { date: "2024-04-26", sales: 7, scans: 13 },
  { date: "2024-04-27", sales: 38, scans: 42 },
  { date: "2024-04-28", sales: 12, scans: 18 },
  { date: "2024-04-29", sales: 31, scans: 24 },
  { date: "2024-04-30", sales: 45, scans: 38 },
]

export function ChartAreaInteractive({ data = defaultChartData }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date(data[data.length - 1]?.date ?? "2024-04-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Sales & Scans Activity</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Sales and card scans over time
          </span>
          <span className="@[540px]/card:hidden">Sales & scans</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillScans" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string | number | Date) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }}
              minTickGap={30}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="font-medium">
                        {new Date(label).toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </div>
                      <div className="grid gap-1.5">
                        {payload.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="h-2 w-2 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-muted-foreground">
                              {item.name}: {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              dataKey="sales"
              type="monotone"
              fill="url(#fillSales)"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Sales"
            />
            <Area
              dataKey="scans"
              type="monotone"
              fill="url(#fillScans)"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Scans"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
