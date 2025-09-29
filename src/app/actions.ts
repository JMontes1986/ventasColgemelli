
'use server';

import 'dotenv/config'; // Load environment variables
import type { Purchase } from '@/lib/types';
import { sendWhatsAppMessage } from '@/lib/services/clientify-service';
import { formatCurrency } from '@/lib/utils';

/**
 * Formats the purchase details into a user-friendly WhatsApp message.
 * @param {Purchase} purchase - The purchase object.
 * @returns {string} The formatted message.
 */
function formatPurchaseForWhatsApp(purchase: Purchase): string {
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


/**
 * Server action to send a WhatsApp notification for a new pre-sale.
 * @param {Purchase} purchase - The purchase details.
 * @param {string} clientCelular - The client's phone number.
 * @returns {Promise<boolean>} True if the notification was sent successfully.
 */
export async function sendWhatsAppNotification(purchase: Purchase, clientCelular: string): Promise<boolean> {
    if (!clientCelular) {
        console.log("No client phone number provided, skipping WhatsApp notification.");
        return false;
    }
    
    try {
        const message = formatPurchaseForWhatsApp(purchase);
        const success = await sendWhatsAppMessage(clientCelular, message);
        
        if (success) {
            console.log(`WhatsApp notification sent successfully for purchase ${purchase.id} to ${clientCelular}.`);
        } else {
            console.error(`Failed to send WhatsApp notification for purchase ${purchase.id}.`);
        }
        
        return success;
    } catch (error) {
        console.error("Error in sendWhatsAppNotification server action:", error);
        return false;
    }
}
