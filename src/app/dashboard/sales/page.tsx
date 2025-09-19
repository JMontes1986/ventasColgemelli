import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlusCircle,
  XCircle,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { mockTickets, mockOrders } from "@/lib/placeholder-data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const availableTickets = mockTickets.filter(t => t.status === 'available');

export default function SalesPage() {
  return (
    <div>
      <PageHeader
        title="Record Sale"
        description="Create new orders and record payments for ticket sales."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Tickets</CardTitle>
              <CardDescription>
                Select tickets to add to the current order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono">{ticket.uniqueCode}</TableCell>
                        <TableCell>${ticket.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Current Order</CardTitle>
              <CardDescription>Order ID: order-3</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <span>{mockTickets[2].uniqueCode}</span>
                <div className="flex items-center gap-2">
                  <span>${mockTickets[2].price.toFixed(2)}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>{mockTickets[3].uniqueCode}</span>
                <div className="flex items-center gap-2">
                  <span>${mockTickets[3].price.toFixed(2)}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-bold">
                <span>Total</span>
                <span>$30.00</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
              <Button variant="outline" className="w-full">
                Cancel Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
       <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.slice(0, 3).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={order.status === 'paid' ? 'default' : 'secondary'}
                        className={order.status === 'paid' ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30' : ''}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.sellerName}</TableCell>
                    <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
