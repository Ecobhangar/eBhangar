import nodemailer from 'nodemailer';

// Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ebhangar.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASSWORD;

// Admin WhatsApp number for notifications
const ADMIN_WHATSAPP = '+919226255355';

// Create transporter
const createTransporter = () => {
  // If no SMTP credentials, return null (email disabled)
  if (!SMTP_USER || !SMTP_PASS) {
    console.log('[email] SMTP credentials not configured - email notifications disabled');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465 (implicit TLS), false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export async function sendBookingNotification(booking: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{ categoryName: string; quantity: number; estimatedValue: string }>;
  totalValue: string;
  id: string;
}) {
  const transporter = createTransporter();
  
  // If transporter is null, skip email (log only)
  if (!transporter) {
    console.log('[email] New booking created - Email notification skipped (no SMTP config)');
    console.log(`[email] Booking ID: ${booking.id}, Customer: ${booking.customerName}, Total: ₹${booking.totalValue}`);
    return;
  }

  const itemsList = booking.items
    .map(item => `${item.categoryName} x${item.quantity} (₹${item.estimatedValue})`)
    .join('\n');

  const emailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">🔔 New Booking Received - eBhangar</h2>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Customer Details:</h3>
        <p><strong>Name:</strong> ${booking.customerName}</p>
        <p><strong>Phone:</strong> ${booking.customerPhone}</p>
        <p><strong>Address:</strong> ${booking.customerAddress}</p>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Items:</h3>
        <pre style="white-space: pre-wrap;">${itemsList}</pre>
      </div>

      <div style="background: #16a34a; color: white; padding: 15px; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0;">Total Estimated Value: ₹${booking.totalValue}</h3>
      </div>

      <p style="margin-top: 20px;">
        <strong>Action Required:</strong> Please assign a vendor to this booking.
      </p>

      <hr style="margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">
        Booking ID: ${booking.id}<br>
        Admin WhatsApp: ${ADMIN_WHATSAPP}
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"eBhangar Notifications" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🔔 New Booking: ${booking.customerName} - ₹${booking.totalValue}`,
      html: emailHTML,
    });
    
    console.log(`[email] Booking notification sent to ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('[email] Failed to send notification:', error);
  }
}
