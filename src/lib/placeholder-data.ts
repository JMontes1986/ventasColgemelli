
import type { User, Ticket, Order, CashboxSession, AuditLog, Product } from '@/lib/types';

export const mockUsers: User[] = [
  { id: 'user-1', username: 'admin', name: 'Administrador', password: 'password', role: 'admin', avatarUrl: `https://picsum.photos/seed/admin/100/100` },
  { id: 'user-2', username: 'carlos.ruiz', name: 'Carlos Ruiz', password: 'password', role: 'cashier', avatarUrl: `https://picsum.photos/seed/carlos.ruiz/100/100` },
  { id: 'user-3', username: 'sofia.gomez', name: 'Sofia Gomez', password: 'password', role: 'seller', avatarUrl: `https://picsum.photos/seed/sofia.gomez/100/100` },
  { id: 'user-4', username: 'david.chen', name: 'David Chen', password: 'password', role: 'auditor', avatarUrl: `https://picsum.photos/seed/david.chen/100/100` },
  { id: 'user-5', username: 'maria.rodriguez', name: 'Maria Rodriguez', password: 'password', role: 'readonly', avatarUrl: `https://picsum.photos/seed/maria.rodriguez/100/100` },
];

export const mockTickets: Ticket[] = [];

export const mockOrders: Order[] = [];

export const mockCashboxSessions: CashboxSession[] = [];

export const mockAuditLogs: AuditLog[] = [];

export const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Carne Asada', price: 12.50, stock: 50, imageUrl: `https://picsum.photos/seed/CarneAsada/400/400`, imageHint: 'grilled meat' },
    { id: 'prod-2', name: 'Lechona', price: 15.00, stock: 30, imageUrl: `https://picsum.photos/seed/Lechona/400/400`, imageHint: 'roast pork' },
    { id: 'prod-3', name: 'Frijoles con Garra', price: 10.00, stock: 60, imageUrl: `https://picsum.photos/seed/FrijolesconGarra/400/400`, imageHint: 'bean stew' },
    { id: 'prod-4', name: 'Sancocho de Gallina', price: 11.00, stock: 40, imageUrl: `https://picsum.photos/seed/SancochodeGallina/400/400`, imageHint: 'beef soup' },
    { id: 'prod-5', name: 'Tamal', price: 8.00, stock: 80, imageUrl: `https://picsum.photos/seed/Tamal/400/400`, imageHint: 'tamale' },
    { id: 'prod-6', name: 'Chorizo Santarrosano', price: 5.50, stock: 100, imageUrl: `https://picsum.photos/seed/ChorizoSantarrosano/400/400`, imageHint: 'sausage' },
    { id: 'prod-7', name: 'Gaseosa', price: 2.50, stock: 120, imageUrl: `https://picsum.photos/seed/Gaseosa/400/400`, imageHint: 'soda can' },
    { id: 'prod-8', name: 'Botella de Agua', price: 1.00, stock: 150, imageUrl: `https://picsum.photos/seed/BotelladeAgua/400/400`, imageHint: 'water bottle' },
];
