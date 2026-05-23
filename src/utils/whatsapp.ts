import { Order, Measurement } from '@/types';
import { format } from 'date-fns';

export function buildMeasurementMessage(m: Measurement): string {
  const garmentLines = Object.entries(m.garments)
    .filter(([, fields]) => Object.keys(fields).length > 0)
    .map(([garment, fields]) => {
      const rows = Object.entries(fields)
        .filter(([, v]) => v !== '' && v != null)
        .map(([label, val]) => `  • ${label}: ${val} in`)
        .join('\n');
      return `👗 *${garment.toUpperCase()}*\n${rows}`;
    })
    .join('\n\n');

  const lines = [
    `📐 *Measurement Slip*`,
    ``,
    `👤 *${m.customerName}*`,
    m.customerPhone ? `📱 ${m.customerPhone}` : '',
    ``,
    `━━━━━━━━━━━━━━`,
    garmentLines,
    `━━━━━━━━━━━━━━`,
    m.notes ? `\n📝 _${m.notes}_` : '',
  ]
    .filter((l) => l !== null && l !== undefined)
    .join('\n')
    .trim();

  return lines;
}

export function shareMeasurementWhatsApp(m: Measurement): void {
  const text = buildMeasurementMessage(m);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export function buildWhatsAppBill(order: Order, boutiqueName: string): string {
  const items = order.items
    .map((i) => `  • ${i.garment} — ₹${i.amount.toLocaleString('en-IN')}`)
    .join('\n');

  const statusEmoji =
    order.balanceAmount <= 0 ? '✅' : order.paidAmount > 0 ? '🔄' : '⏳';

  const lines = [
    `*${boutiqueName}*`,
    `📋 Order Id #${order.orderNumber}`,
    '',
    `👤 ${order.customerName}`,

    // order.customerPhone ? `📱 ${order.customerPhone}` : '',
    // `📅 Order Date: ${format(order.orderDate, 'd MMM yyyy')}`,
    // order.deliveryDate ? `🚚 Delivery: ${format(order.deliveryDate, 'd MMM yyyy')}` : '',
    `━━━━━━━━━━━━━━━`,
    `*Items:*`,
    items,
    `━━━━━━━━━━━━━━━`,
    `💰 *Total: ₹${order.totalAmount}*`,
    order.paidAmount > 0
      ? `✅ Paid: ₹${order.paidAmount}`
      : '',
    order.balanceAmount > 0
      ? `🔴 *Balance Due: ₹${order.balanceAmount}*`
      : `✅ *Fully Paid*`,
    '',
    `${statusEmoji} Status: ${order.status.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
    '',
    order.notes ? `📝 _${order.notes}_\n` : '',
    `_Thank you for choosing ${boutiqueName}!_ ❤️ `,
  ]
    .filter((l) => l !== null && l !== undefined)
    .join('\n')
    .trim();

  return lines;
}

export function openWhatsAppBill(order: Order, boutiqueName: string): void {
  const text = buildWhatsAppBill(order, boutiqueName);
  const phone = order.customerPhone?.replace(/\D/g, '') || '';
  const url = phone
    ? `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
