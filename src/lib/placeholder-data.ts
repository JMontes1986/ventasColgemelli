
import type { User, Ticket, Order, CashboxSession, AuditLog, Product } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Administrador', email: 'administrador@colegemelli.edu', role: 'admin', avatarUrl: findImage('avatar-1') },
  { id: 'user-2', name: 'Carlos Ruiz', email: 'carlos.ruiz@colegemelli.edu', role: 'cashier', avatarUrl: findImage('avatar-2') },
  { id: 'user-3', name: 'Sofia Gomez', email: 'sofia.gomez@colegemelli.edu', role: 'seller', avatarUrl: findImage('avatar-3') },
  { id: 'user-4', name: 'David Chen', email: 'david.chen@colegemelli.edu', role: 'auditor', avatarUrl: findImage('avatar-4') },
  { id: 'user-5', name: 'Maria Rodriguez', email: 'maria.rodriguez@colegemelli.edu', role: 'readonly', avatarUrl: findImage('avatar-5') },
];

export const mockTickets: Ticket[] = [
  { id: 'ticket-1', uniqueCode: 'CG2024-A1B2', qrCodeUrl: findImage('qr-code-placeholder'), status: 'sold', price: 15.00, issuedAt: '2024-05-20T10:00:00Z', soldAt: '2024-05-21T11:30:00Z', orderId: 'order-1' },
  { id: 'ticket-2', uniqueCode: 'CG2024-C3D4', qrCodeUrl: findImage('qr-code-placeholder'), status: 'redeemed', price: 15.00, issuedAt: '2024-05-20T10:00:00Z', soldAt: '2024-05-21T12:00:00Z', redeemedAt: '2024-05-22T09:15:00Z', orderId: 'order-2' },
  { id: 'ticket-3', uniqueCode: 'CG2024-E5F6', qrCodeUrl: findImage('qr-code-placeholder'), status: 'available', price: 15.00, issuedAt: '2024-05-20T10:00:00Z' },
  { id: 'ticket-4', uniqueCode: 'CG2024-G7H8', qrCodeUrl: findImage('qr-code-placeholder'), status: 'available', price: 15.00, issuedAt: '2024-05-20T10:00:00Z' },
  { id: 'ticket-5', uniqueCode: 'CG2024-I9J0', qrCodeUrl: findImage('qr-code-placeholder'), status: 'void', price: 15.00, issuedAt: '2024-05-20T10:00:00Z' },
];

export const mockOrders: Order[] = [
  { id: 'order-1', ticketIds: ['ticket-1'], totalAmount: 15.00, status: 'paid', createdAt: '2024-05-21T11:30:00Z', paidAt: '2024-05-21T11:32:00Z', sellerId: 'user-3', sellerName: 'Sofia Gomez' },
  { id: 'order-2', ticketIds: ['ticket-2'], totalAmount: 15.00, status: 'paid', createdAt: '2024-05-21T12:00:00Z', paidAt: '2024-05-21T12:01:00Z', sellerId: 'user-3', sellerName: 'Sofia Gomez' },
  { id: 'order-3', ticketIds: [], totalAmount: 30.00, status: 'pending', createdAt: '2024-05-22T14:00:00Z', sellerId: 'user-2', sellerName: 'Carlos Ruiz' },
];

export const mockCashboxSessions: CashboxSession[] = [
  { id: 'cs-1', userId: 'user-2', userName: 'Carlos Ruiz', status: 'closed', openingBalance: 100.00, closingBalance: 530.00, openedAt: '2024-05-21T08:00:00Z', closedAt: '2024-05-21T17:00:00Z', totalSales: 430.00 },
  { id: 'cs-2', userId: 'user-2', userName: 'Carlos Ruiz', status: 'open', openingBalance: 100.00, openedAt: '2024-05-22T08:00:00Z', totalSales: 30.00 },
];

export const mockAuditLogs: AuditLog[] = [
    { id: 'al-1', timestamp: '2024-05-22T09:15:00Z', userId: 'user-4', userName: 'David Chen', action: 'TICKET_REDEEM', details: 'Ticket CG2024-C3D4 redeemed at gate A.' },
    { id: 'al-2', timestamp: '2024-05-21T17:00:00Z', userId: 'user-2', userName: 'Carlos Ruiz', action: 'CASHBOX_CLOSE', details: 'Cashbox closed with total sales of $430.00.' },
    { id: 'al-3', timestamp: '2024-05-21T12:01:00Z', userId: 'user-3', userName: 'Sofia Gomez', action: 'PAYMENT_CONFIRM', details: 'Payment confirmed for order order-2.' },
    { id: 'al-4', timestamp: '2024-05-20T10:00:00Z', userId: 'user-1', userName: 'Ana Garcia', action: 'TICKET_ISSUE', details: 'Issued 50 new tickets.' },
    { id: 'al-5', timestamp: '2024-05-20T09:00:00Z', userId: 'user-1', userName: 'Ana Garcia', action: 'USER_ROLE_CHANGE', details: 'Role for maria.rodriguez@colegemelli.edu changed to readonly.' },
];

export const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Carne Asada', price: 12.50, stock: 50, category: 'Platos Fuertes', imageUrl: findImage('food-carne-asada'), imageHint: 'grilled meat' },
    { id: 'prod-2', name: 'Lechona', price: 15.00, stock: 30, category: 'Platos Fuertes', imageUrl: findImage('food-lechona'), imageHint: 'roast pork' },
    { id: 'prod-3', name: 'Frijoles con Garra', price: 10.00, stock: 60, category: 'Platos Fuertes', imageUrl: findImage('food-frijoles'), imageHint: 'bean stew' },
    { id: 'prod-4', name: 'Sancocho de Gallina', price: 11.00, stock: 40, category: 'Sopas', imageUrl: findImage('food-sancocho'), imageHint: 'beef soup' },
    { id: 'prod-5', name: 'Tamal', price: 8.00, stock: 80, category: 'Desayunos', imageUrl: findImage('food-tamal'), imageHint: 'tamale' },
    { id: 'prod-6', name: 'Chorizo Santarrosano', price: 5.50, stock: 100, category: 'Aperitivos', imageUrl: findImage('food-chorizo'), imageHint: 'sausage' },
    { id: 'prod-7', name: 'Gaseosa', price: 2.50, stock: 120, category: 'Bebidas', imageUrl: findImage('food-gaseosa'), imageHint: 'soda can' },
    { id: 'prod-8', name: 'Botella de Agua', price: 1.00, stock: 150, category: 'Bebidas', imageUrl: findImage('food-agua'), imageHint: 'water bottle' },
];
