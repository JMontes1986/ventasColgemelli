import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { mockAuditLogs } from "@/lib/placeholder-data";
import type { AuditLogAction } from "@/lib/types";
import { cn } from "@/lib/utils";

const getActionVariant = (action: AuditLogAction) => {
    switch (action) {
        case 'TICKET_ISSUE':
        case 'USER_ROLE_CHANGE':
            return 'bg-blue-500/20 text-blue-700';
        case 'TICKET_SELL':
        case 'PAYMENT_CONFIRM':
            return 'bg-green-500/20 text-green-700';
        case 'TICKET_REDEEM':
            return 'bg-purple-500/20 text-purple-700';
        case 'TICKET_VOID':
        case 'CASHBOX_CLOSE':
            return 'bg-yellow-500/20 text-yellow-700';
        default:
            return 'bg-gray-500/20 text-gray-700';
    }
}

export default function AuditPage() {
  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Review a log of all sensitive actions taken in the system."
      />
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            All recorded actions are displayed with the most recent first.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-mono", getActionVariant(log.action))}>
                        {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
