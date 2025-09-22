
import type { ModulePermission, UserRole } from './types';

const permissions: Record<UserRole, ModulePermission[]> = {
  admin: [
    'dashboard',
    'sales',
    'self-service',
    'products',
    'redeem',
    'cashbox',
    'returns',
    'users',
    'audit',
  ],
  cashier: [
    'dashboard',
    'sales',
    'redeem',
    'cashbox',
    'returns',
  ],
  seller: [
    'dashboard',
    'sales',
    'redeem',
  ],
  auditor: [
    'dashboard',
    'audit',
  ],
};

export const getPermissionsForRole = (role: UserRole): ModulePermission[] => {
  return permissions[role] || [];
};
