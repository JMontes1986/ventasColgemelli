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
  const auditLogs: any[] = []; // Empty array

  return (
    <div>
      <PageHeader
        title="Registro de Auditoría"
        description="Revise un registro de todas las acciones sensibles realizadas en el sistema."
      />
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
          <CardDescription>
            Todas las acciones registradas se muestran con la más reciente primero.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca de Tiempo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No hay registros de auditoría.
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
