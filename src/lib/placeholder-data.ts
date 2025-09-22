
import type { User, Ticket, Order, CashboxSession, AuditLog, Product, ModulePermission, UserRole, NewUser } from '@/lib/types';

export const mockUsers: Omit<NewUser, 'password' | 'avatarUrl'>[] = [
  { username: 'admin.test', name: 'Admin Prueba', role: 'admin' },
  { username: 'julian.montes', name: 'Julian Montes', role: 'admin' },
  { username: 'admin', name: 'Administrador', role: 'admin' },
  { username: 'carlos.ruiz', name: 'Carlos Ruiz', role: 'cashier' },
  { username: 'sofia.gomez', name: 'Sofia Gomez', role: 'cashier' },
  { username: 'david.chen', name: 'David Chen', role: 'seller' },
  { username: 'maria.rodriguez', name: 'Maria Rodriguez', role: 'seller' },
];

export const mockTickets: Ticket[] = [];

export const mockOrders: Order[] = [];

export const mockCashboxSessions: CashboxSession[] = [];

export const mockAuditLogs: AuditLog[] = [];

export const mockProducts: Omit<Product, 'position'>[] = [];
