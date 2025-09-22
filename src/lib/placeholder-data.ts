
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

export const mockProducts: Omit<Product, 'position'>[] = [
    { id: 'prod-1', name: 'Carne Asada', price: 12.50, stock: 50, imageUrl: `https://picsum.photos/seed/CarneAsada/400/400`, imageHint: 'grilled meat', isSelfService: true, isPosAvailable: true, restockCount: 0 },
    { id: 'prod-2', name: 'Lechona', price: 15.00, stock: 30, imageUrl: `https://picsum.photos/seed/Lechona/400/400`, imageHint: 'roast pork', isSelfService: true, isPosAvailable: true, restockCount: 0 },
    { id: 'prod-3', name: 'Frijoles con Garra', price: 10.00, stock: 60, imageUrl: `https://picsum.photos/seed/FrijolesconGarra/400/400`, imageHint: 'bean stew', isSelfService: false, isPosAvailable: true, restockCount: 0 },
    { id: 'prod-4', name: 'Sancocho de Gallina', price: 11.00, stock: 40, imageUrl: `https://picsum.photos/seed/SancochodeGallina/400/400`, imageHint: 'beef soup', isSelfService: false, isPosAvailable: true, restockCount: 0 },
    { id: 'prod-5', name: 'Tamal', price: 8.00, stock: 80, imageUrl: `https://picsum.photos/seed/Tamal/400/400`, imageHint: 'tamale', isSelfService: true, isPosAvailable: true, restockCount: 0 },
    { id: 'prod-6', name: 'Chorizo Santarrosano', price: 5.50, stock: 100, imageUrl: `https://picsum.photos/seed/ChorizoSantarrosano/400/400`, imageHint: 'sausage', isSelfService: true, isPosAvailable: true, restockCount: 0 },
    { id: 'prod-7', name: 'Gaseosa', price: 2.50, stock: 120, imageUrl: `https://picsum.photos/seed/Gaseosa/400/400`, imageHint: 'soda can', isSelfService: true, isPosAvailable: true, restockCount: 0 },
    { id: 'prod-8', name: 'Botella de Agua', price: 1.00, stock: 150, imageUrl: `https://picsum.photos/seed/BotelladeAgua/400/400`, imageHint: 'water bottle', isSelfService: true, isPosAvailable: true, restockCount: 0 },
];
