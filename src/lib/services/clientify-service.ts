// This service handles interactions with the Clientify API.
import type { Purchase } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';


/**
 * Formats the purchase details into a user-friendly WhatsApp message.
 * @param {Purchase} purchase - The purchase object.
 * @returns {string} The formatted message.
 */
export function formatPurchaseForWhatsApp(purchase: Purchase): string {
    let message = `¡Preventa Registrada Exitosamente!\n\n`;
    message += `Hola, gracias por tu compra en el Colegio Gemelli. Presenta este código en caja para pagar y reclamar tus productos.\n\n`;
    message += `*Código de Preventa:* ${purchase.id}\n`;
    message += `*Fecha:* ${purchase.date}\n`;
    message += `*Cliente C.C:* ${purchase.cedula}\n\n`;
    message += `*Resumen de la Compra:*\n`;
    
    purchase.items.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}\n`;
    });

    message += `\n*Total a Pagar:* ${formatCurrency(purchase.total)}\n\n`;
    message += `¡Te esperamos!`;

    return message;
}