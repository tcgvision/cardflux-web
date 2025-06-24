import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

interface SectionCardsProps {
  totalRevenue?: number;
  newCustomers?: number;
  activeInventory?: number;
  growthRate?: number;
}

export function SectionCards({ 
  totalRevenue = 1250.00,
  newCustomers = 1234,
  activeInventory = 45678,
  growthRate = 12.5
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            ${totalRevenue.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{growthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Revenue for the last 30 days
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
        <CardHeader>
          <CardDescription>Total Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {newCustomers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Growing customer base <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Active customers in your shop
          </div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
        <CardHeader>
          <CardDescription>Inventory Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {activeInventory.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +5.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Inventory growing steadily <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Cards in your collection</div>
        </CardFooter>
      </Card>
      <Card className="bg-gradient-to-t from-primary/5 to-card shadow-sm">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {growthRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{growthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong business growth <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Month-over-month increase</div>
        </CardFooter>
      </Card>
    </div>
  )
}
