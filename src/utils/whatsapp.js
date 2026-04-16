export function generateBillMessage(order) {
  const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`;
  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); } catch{ return d||''; } };
  const items = (order.items||'').split(/[,\n]/).map(i=>i.trim()).filter(Boolean).map(i=>`• ${i}`).join('\n');
  return [
    `✨ *Sri Fashion Fusion* ✨`,`━━━━━━━━━━━━━━━`,``,
    `👤 *${order.name}*`,
    order.date  ? `📅 ${fmtDate(order.date)}`    : null,
    order.ddate ? `🚚 Delivery: ${fmtDate(order.ddate)}` : null,
    ``,`*Order Details* 👗`,`━━━━━━━━━━━━━━━`,items,``,
    `*Payment* 💰`,`━━━━━━━━━━━━━━━`,
    `Total   : *${fmt(order.total)}*`,
    // order.material>0 ? `Material: ${fmt(order.material)}` : null,
    order.given>0    ? `Paid    : ${fmt(order.given)}`    : null,
    order.balance>0  ? `Balance : *${fmt(order.balance)}*` : `✅ Fully Paid`,
    `━━━━━━━━━━━━━━━`,``,`Thank you for choosing us ❤️`,`DM for custom designs ✨`,
  ].filter(l=>l!==null).join('\n');
}

export function shareOnWhatsApp(order, phone='') {
  const url = phone.replace(/\D/g,'')
    ? `https://wa.me/91${phone.replace(/\D/g,'')}?text=${encodeURIComponent(generateBillMessage(order))}`
    : `https://wa.me/?text=${encodeURIComponent(generateBillMessage(order))}`;
  window.open(url,'_blank');
}
