import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
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
import { mockTickets } from "@/lib/placeholder-data";
import { PlusCircle } from "lucide-react";
import { RoleGate } from "@/components/role-gate";
import { cn } from "@/lib/utils";

export default function TicketsPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-700 hover:bg-green-500/30";
      case "sold":
        return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30";
      case "redeemed":
        return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30";
      case "void":
        return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30";
      default:
        return "secondary";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "sold":
        return "Vendido";
      case "redeemed":
        return "Canjeado";
      case "void":
        return "Anulado";
      default:
        return status;
    }
  }

  return (
    <div>
      <PageHeader
        title="Boletos"
        description="Gestionar, emitir y rastrear todos los boletos del evento."
      >
        <RoleGate allowedRoles={['admin']}>
            <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Emitir Boletos
            </Button>
        </RoleGate>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Boletos</CardTitle>
          <CardDescription>
            Una lista de todos los boletos en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código Único</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Emisión</TableHead>
                <TableHead className="text-right">Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-mono">{ticket.uniqueCode}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", getStatusVariant(ticket.status))}>
                      {translateStatus(ticket.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.issuedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${ticket.price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
