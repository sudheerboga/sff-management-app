// Export filtered orders as PDF or Excel

const fmt  = n => `₹${Number(n||0).toLocaleString('en-IN')}`;
const fmtD = d => { try { return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); } catch { return d||''; } };

export async function exportOrdersPDF(orders, label='All Orders') {
  const { default: jsPDF }     = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });

  // Header
  doc.setFillColor(74,111,212);  doc.rect(0,0,297,24,'F');
  doc.setFillColor(123,94,167);  doc.rect(99,0,198,24,'F');
  doc.setFillColor(201,107,154); doc.rect(198,0,99,24,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.text('Sri Fashion Fusion — Orders Report',14,10);
  doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text(`${label}   •   Generated ${new Date().toLocaleString('en-IN')}`,14,17);
  doc.text(`Total: ${orders.length} orders`,283,10,{align:'right'});

  // Summary row
  const totalRev  = orders.reduce((s,o)=>s+(o.total||0),0);
  const totalProf = orders.reduce((s,o)=>s+(o.profit||0),0);
  const totalBal  = orders.reduce((s,o)=>s+(o.balance||0),0);
  doc.setTextColor(26,22,37);
  doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text(`Revenue: ${fmt(totalRev)}   Profit: ${fmt(totalProf)}   Balance Due: ${fmt(totalBal)}`,14,32);

  const rows = orders.map(o => [
    o.sffId||'-',
    o.name||'-',
    o.mobile||'-',
    fmtD(o.date),
    fmtD(o.ddate)||'-',
    o.items||'-',
    o.status||'-',
    fmt(o.total),
    fmt(o.material||0),
    fmt(o.given||0),
    fmt(o.balance||0),
    fmt(o.profit||0),
  ]);

  autoTable(doc,{
    startY:38,
    head:[['Order ID','Customer','Mobile','Order Date','Delivery','Items','Status','Total','Material','Paid','Balance','Profit']],
    body:rows,
    margin:{left:10,right:10},
    styles:{fontSize:7.5,cellPadding:2.5,textColor:[26,22,37],overflow:'linebreak'},
    headStyles:{fillColor:[123,94,167],textColor:255,fontStyle:'bold',fontSize:8},
    alternateRowStyles:{fillColor:[243,239,249]},
    columnStyles:{
      0:{cellWidth:28,fontStyle:'bold'},
      1:{cellWidth:26},
      2:{cellWidth:22},
      3:{cellWidth:22},
      4:{cellWidth:22},
      5:{cellWidth:40},
      6:{cellWidth:18},
      7:{cellWidth:18,halign:'right'},
      8:{cellWidth:18,halign:'right'},
      9:{cellWidth:18,halign:'right'},
      10:{cellWidth:18,halign:'right'},
      11:{cellWidth:18,halign:'right'},
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i=1;i<=pageCount;i++) {
    doc.setPage(i);
    doc.setDrawColor(201,107,154); doc.setLineWidth(0.3); doc.line(10,195,287,195);
    doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(90,84,104);
    doc.text('Sri Fashion Fusion — Premium Tailoring Management',10,199);
    doc.text(`Page ${i} of ${pageCount}`,287,199,{align:'right'});
  }

  const fileLabel = label.replace(/[^a-z0-9]/gi,'_').toLowerCase();
  doc.save(`sff_orders_${fileLabel}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export async function exportOrdersExcel(orders, label='All Orders') {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const totalRev  = orders.reduce((s,o)=>s+(o.total||0),0);
  const totalProf = orders.reduce((s,o)=>s+(o.profit||0),0);
  const totalBal  = orders.reduce((s,o)=>s+(o.balance||0),0);

  const summaryRows = [
    ['Sri Fashion Fusion — Orders Export'],
    [`Filter: ${label}`],
    [`Generated: ${new Date().toLocaleString('en-IN')}`],
    [],
    ['Total Orders', orders.length],
    ['Total Revenue', totalRev],
    ['Total Profit', totalProf],
    ['Total Balance Due', totalBal],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{wch:22},{wch:18}];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Orders sheet
  const header = ['Order ID','Customer','Mobile','Order Date','Delivery Date','Items','Status','Total (₹)','Material (₹)','Paid (₹)','Balance (₹)','Profit (₹)'];
  const dataRows = orders.map(o=>[
    o.sffId||'-', o.name||'-', o.mobile||'-',
    fmtD(o.date), fmtD(o.ddate)||'-',
    o.items||'-', o.status||'-',
    Number(o.total||0), Number(o.material||0), Number(o.given||0), Number(o.balance||0), Number(o.profit||0),
  ]);

  const wsOrders = XLSX.utils.aoa_to_sheet([header,...dataRows]);
  wsOrders['!cols'] = [{wch:22},{wch:20},{wch:14},{wch:14},{wch:14},{wch:36},{wch:14},{wch:14},{wch:14},{wch:14},{wch:14},{wch:14}];
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Orders');

  const fileLabel = label.replace(/[^a-z0-9]/gi,'_').toLowerCase();
  XLSX.writeFile(wb, `sff_orders_${fileLabel}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
