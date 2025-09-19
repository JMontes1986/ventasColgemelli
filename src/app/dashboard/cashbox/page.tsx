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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DoorOpen, DoorClosed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockCashboxSessions } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";

const currentSession = mockCashboxSessions.find(s => s.status === 'open');

export default function CashboxPage() {
    return (
        <div>
            <PageHeader
                title="Cashbox Management"
                description="Open, close, and review cashbox sessions."
            />
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {currentSession ? "Current Session" : "New Session"}
                            </CardTitle>
                            <CardDescription>
                                {currentSession ? `Session for ${currentSession.userName}` : "Start a new cashbox session for the day."}
                            </CardDescription>
                        </CardHeader>
                        {currentSession ? (
                            <>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Opening Balance:</span>
                                        <span className="font-medium">${currentSession.openingBalance.toFixed(2)}</span>
                                    </div>
                                     <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Sales:</span>
                                        <span className="font-medium">${currentSession.totalSales.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Expected in Drawer:</span>
                                        <span>${(currentSession.openingBalance + currentSession.totalSales).toFixed(2)}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="destructive" className="w-full">
                                        <DoorClosed className="mr-2 h-4 w-4" />
                                        Close Cashbox
                                    </Button>
                                </CardFooter>
                            </>
                        ) : (
                             <>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label htmlFor="opening-balance">Opening Balance</Label>
                                        <Input id="opening-balance" type="number" placeholder="100.00" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                        <DoorOpen className="mr-2 h-4 w-4" />
                                        Open Cashbox
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Session History</CardTitle>
                            <CardDescription>Review of past cashbox sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date Closed</TableHead>
                                        <TableHead className="text-right">Closing Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockCashboxSessions.map(session => (
                                        <TableRow key={session.id}>
                                            <TableCell>{session.userName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn(session.status === 'open' ? 'text-green-700 border-green-300' : 'text-gray-700 border-gray-300')}>
                                                    {session.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {session.closedAt ? new Date(session.closedAt).toLocaleString() : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {session.closingBalance ? `$${session.closingBalance.toFixed(2)}` : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
