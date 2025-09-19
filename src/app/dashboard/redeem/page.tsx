import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, TicketCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RedeemPage() {
    return (
        <div>
            <PageHeader
                title="Redeem Ticket"
                description="Scan or enter a ticket code to validate and redeem it."
            />
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Scan Ticket</CardTitle>
                        <CardDescription>
                            Enter the unique code from the ticket's QR code below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ticket-code">Ticket Code</Label>
                                <Input id="ticket-code" placeholder="e.g., CG2024-C3D4" className="font-mono" />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full">
                            <QrCode className="mr-2 h-4 w-4" />
                            Redeem Ticket
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="bg-muted/30">
                     <CardHeader>
                        <CardTitle>Last Scan Status</CardTitle>
                        <CardDescription>
                            Result of the most recent redemption attempt.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center gap-4 p-8">
                        <TicketCheck className="h-16 w-16 text-green-500" />
                        <h3 className="text-xl font-semibold">Ticket Redeemed Successfully</h3>
                        <p className="text-muted-foreground">
                           Code: <span className="font-mono">CG2024-C3D4</span>
                        </p>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-700">
                            Redeemed
                        </Badge>
                    </CardContent>
                    {/* Example of an error state */}
                    {/* <CardContent className="flex flex-col items-center justify-center text-center gap-4 p-8">
                        <AlertTriangle className="h-16 w-16 text-destructive" />
                        <h3 className="text-xl font-semibold">Invalid or Redeemed Ticket</h3>
                        <p className="text-muted-foreground">
                           This ticket has already been used or does not exist.
                        </p>
                    </CardContent> */}
                </Card>
            </div>
        </div>
    );
}
