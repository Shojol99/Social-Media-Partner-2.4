import { Order } from '@/src/types';

/**
 * automation.ts
 * Frontend service that communicates with our Express backend.
 * This keeps all secret keys safe on the server.
 */

export async function grantDriveAccess(customerEmail: string) {
  try {
    const response = await fetch('/api/grant-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: customerEmail }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('[DRIVE DEBUG] Raw Response Text:', text);
      throw new Error(`Invalid drive access response (Status: ${response.status}). The server returned an unexpected format.`);
    }

    if (!response.ok) throw new Error(data.error || 'Server error');
    
    return true;
  } catch (error: any) {
    console.error('[Automation Error]', error.message);
    throw error;
  }
}

export async function sendDeliveryEmail(order: Order) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('[EMAIL DEBUG] Raw Response Text:', text);
      throw new Error(`Invalid email delivery response (Status: ${response.status}). The server returned an unexpected format.`);
    }

    if (!response.ok) throw new Error(data.error || 'Server error');
    
    return true;
  } catch (error: any) {
    console.error('[Automation Error]', error.message);
    throw error;
  }
}
