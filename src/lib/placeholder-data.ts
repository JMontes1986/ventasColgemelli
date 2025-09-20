
import type { User, Ticket, Order, CashboxSession, AuditLog, Product, ModulePermission } from '@/lib/types';

const allPermissions: ModulePermission[] = ['dashboard', 'sales', 'self-service', 'products', 'redeem', 'cashbox', 'returns', 'users', 'audit'];

export const mockUsers: Omit<User, 'id'>[] = [
  { username: 'admin.test', name: 'Admin Prueba', password: 'password', permissions: allPermissions, avatarUrl: `https://picsum.photos/seed/admintest/100/100` },
  { username: 'julian.montes', name: 'Julian Montes', password: 'password', permissions: allPermissions, avatarUrl: `https://picsum.photos/seed/julian.montes/100/100` },
  { username: 'admin', name: 'Administrador', password: 'password', permissions: allPermissions, avatarUrl: `https://picsum.photos/seed/admin/100/100` },
  { username: 'carlos.ruiz', name: 'Carlos Ruiz', password: 'password', permissions: allPermissions, avatarUrl: `https://picsum.photos/seed/carlos.ruiz/100/100` },
  { username: 'sofia.gomez', name: 'Sofia Gomez', password: 'password', permissions: allPermissions, avatarUrl: `https://picsum.photos/seed/sofia.gomez/100/100` },
  { username: 'david.chen', name: 'David Chen', password: 'password', permissions: allPermissions, avatarUrl: `https://picsum.photos/seed/david.chen/100/100` },
  { username: 'maria.rodriguez', name: 'Maria Rodriguez', password: 'password', permissions: allPermissions, avatarUrl: `https://picsum.photos/seed/maria.rodriguez/100/100` },
];

export const mockTickets: Ticket[] = [];

export const mockOrders: Order[] = [];

export const mockCashboxSessions: CashboxSession[] = [];

export const mockAuditLogs: AuditLog[] = [];

export const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Carne Asada', price: 12.50, stock: 50, imageUrl: `https://picsum.photos/seed/CarneAsada/400/400`, imageHint: 'grilled meat', isSelfService: true, isPosAvailable: true },
    { id: 'prod-2', name: 'Lechona', price: 15.00, stock: 30, imageUrl: `https://picsum.photos/seed/Lechona/400/400`, imageHint: 'roast pork', isSelfService: true, isPosAvailable: true },
    { id: 'prod-3', name: 'Frijoles con Garra', price: 10.00, stock: 60, imageUrl: `https://picsum.photos/seed/FrijolesconGarra/400/400`, imageHint: 'bean stew', isSelfService: false, isPosAvailable: true },
    { id: 'prod-4', name: 'Sancocho de Gallina', price: 11.00, stock: 40, imageUrl: `https://picsum.photos/seed/SancochodeGallina/400/400`, imageHint: 'beef soup', isSelfService: false, isPosAvailable: true },
    { id: 'prod-5', name: 'Tamal', price: 8.00, stock: 80, imageUrl: `https://picsum.photos/seed/Tamal/400/400`, imageHint: 'tamale', isSelfService: true, isPosAvailable: true },
    { id: 'prod-6', name: 'Chorizo Santarrosano', price: 5.50, stock: 100, imageUrl: `https://picsum.photos/seed/ChorizoSantarrosano/400/400`, imageHint: 'sausage', isSelfService: true, isPosAvailable: true },
    { id: 'prod-7', name: 'Gaseosa', price: 2.50, stock: 120, imageUrl: `https://picsum.photos/seed/Gaseosa/400/400`, imageHint: 'soda can', isSelfService: true, isPosAvailable: true },
    { id: 'prod-8', name: 'Botella de Agua', price: 1.00, stock: 150, imageUrl: `https://picsum.photos/seed/BotelladeAgua/400/400`, imageHint: 'water bottle', isSelfService: true, isPosAvailable: true },
];
