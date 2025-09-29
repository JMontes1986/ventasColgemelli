
'use server';

import type { Purchase } from '@/lib/types';
import { formatPurchaseForWhatsApp } from '@/lib/services/clientify-service';

/**
 * Obtains an authentication token from the Clientify API.
 * The credentials (username and password) must be stored in environment variables.
 * @returns {Promise<string | null>} The authentication token or null if failed.
 */
async function getClientifyAuthToken(): Promise<string | null> {
    const username = process.env.CLIENTIFY_USERNAME;
    const password = process.env.CLIENTIFY_PASSWORD;

    if (!username || !password) {
        console.error("CLIENTIFY_USERNAME or CLIENTIFY_PASSWORD not set in environment variables.");
        return null;
    }

    try {
        const response = await fetch('https://api.clientify.net/v1/api-auth/obtain_token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.token) {
            console.error("Failed to obtain Clientify token. Response Status:", response.status);
            console.error("Response Body:", data);
            return null;
        }

        return data.token;

    } catch (error) {
        console.error("Error fetching Clientify token:", error);
        return null;
    }
}

/**
 * Sends a WhatsApp message using the Clientify API.
 * It first obtains an auth token and then sends the message.
 * @param {string} to - The recipient's phone number.
 * @param {string} message - The message content.
 * @returns {Promise<boolean>} True if the message was sent successfully, false otherwise.
 */
async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  const token = await getClientifyAuthToken();

  if (!token) {
    console.error("Cannot send WhatsApp message without a valid Clientify token.");
    return false;
  }

  // Ensure the number has the Colombian country code prefix and is clean
  let formattedTo = to.trim().replace(/\s+/g, ''); // Remove spaces and non-numeric chars
  if (formattedTo.startsWith('+')) {
      formattedTo = formattedTo.substring(1);
  }
  if (formattedTo.startsWith('57')) {
      // If it already starts with 57, do nothing to avoid 5757...
  } else {
      formattedTo = `57${formattedTo}`;
  }
  
  const API_URL = 'https://api.clientify.net/v1/whatsapp/messages/send/';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        phone: formattedTo,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Failed to send WhatsApp message via Clientify. Status:", response.status);
      console.error("Error Body:", errorBody);
      return false;
    }
    
    console.log("WhatsApp message sent successfully via Clientify.");
    return true;

  } catch (error) {
    console.error("Error during Clientify send request:", error);
    return false;
  }
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
