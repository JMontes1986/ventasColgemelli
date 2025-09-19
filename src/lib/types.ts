export type UserRole = 'admin' | 'cashier' | 'seller' | 'auditor' | 'readonly';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
};

export type TicketStatus = 'available' | 'sold' | 'redeemed' | 'void';

export type Ticket = {
  id: string;
  uniqueCode: string;
  qrCodeUrl: string;
  status: TicketStatus;
  price: number;
  issuedAt: string;
  soldAt?: string;
  redeemedAt?: string;
  orderId?: string;
};

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export type Order = {
  id: string;
  ticketIds: string[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  sellerId: string;
  sellerName: string;
};

export type CashboxStatus = 'open' | 'closed';

export type CashboxSession = {
  id: string;
  userId: string;
  userName: string;
  status: CashboxStatus;
  openingBalance: number;
  closingBalance?: number;
  openedAt: string;
  closedAt?: string;
  totalSales: number;
};

export type AuditLogAction = 'TICKET_ISSUE' | 'TICKET_SELL' | 'TICKET_REDEEM' | 'TICKET_VOID' | 'CASHBOX_OPEN' | 'CASHBOX_CLOSE' | 'USER_ROLE_CHANGE' | 'PAYMENT_CONFIRM';

export type AuditLog = {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditLogAction;
  details: string;
};
