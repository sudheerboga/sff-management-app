const GARMENT_LABELS = { blouse:'Blouse', frock:'Frock / Dress', lehenga:'Lehenga', top:'Top & Bottom' };
const GARMENT_ORDER  = ['blouse','frock','lehenga','top'];

function toLabel(key) { return key.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()); }

export async function exportMeasurementsPDF(customerName, measurements) {
  const { default: jsPDF }     = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });

  // Header bar — brand gradient blue→violet
  doc.setFillColor(74,111,212);  doc.rect(0,0,210,28,'F');
  doc.setFillColor(123,94,167);  doc.rect(70,0,140,28,'F');
  doc.setFillColor(201,107,154); doc.rect(140,0,70,28,'F');

  doc.setTextColor(255,255,255);
  doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('Sri Fashion Fusion',14,12);
  doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text('Premium Tailoring Management',14,19);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}),196,12,{align:'right'});

  doc.setTextColor(26,22,37);
  doc.setFontSize(15); doc.setFont('helvetica','bold');
  doc.text(`Measurements — ${customerName}`,14,40);
  doc.setDrawColor(123,94,167); doc.setLineWidth(0.4); doc.line(14,44,196,44);

  let y = 52;
  for (const g of GARMENT_ORDER) {
    const data = measurements[g];
    if (!data || Object.keys(data).length===0) continue;
    const rows = Object.entries(data).filter(([,v])=>v!==''&&v!=null).map(([k,v])=>[toLabel(k),`${v} inches`]);
    if (!rows.length) continue;

    doc.setFillColor(243,239,249); doc.rect(14,y-3,182,7,'F');
    doc.setTextColor(123,94,167); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(GARMENT_LABELS[g]||g,16,y+1);
    y += 8;

    autoTable(doc,{
      startY:y, head:[['Measurement','Value']],body:rows,
      margin:{left:14,right:14},
      styles:{fontSize:10,cellPadding:3,textColor:[26,22,37]},
      headStyles:{fillColor:[201,107,154],textColor:255,fontStyle:'bold',fontSize:10},
      alternateRowStyles:{fillColor:[253,240,246]},
      columnStyles:{0:{fontStyle:'bold',cellWidth:90},1:{cellWidth:60}},
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Footer
  doc.setDrawColor(201,107,154); doc.setLineWidth(0.3); doc.line(14,280,196,280);
  doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(90,84,104);
  doc.text('Sri Fashion Fusion — Premium Tailoring',14,285);
  doc.text(`Generated ${new Date().toLocaleString('en-IN')}`,196,285,{align:'right'});

  doc.save(`${customerName.replace(/\s+/g,'_')}_measurements.pdf`);
}

export async function exportMeasurementsExcel(customerName, measurements) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const rows = [
    ['Sri Fashion Fusion — Customer Measurements'],
    [`Customer: ${customerName}`],
    [`Generated: ${new Date().toLocaleString('en-IN')}`],
    [],
  ];

  for (const g of GARMENT_ORDER) {
    const data = measurements[g];
    if (!data || Object.keys(data).length===0) continue;
    rows.push([GARMENT_LABELS[g]||g]);
    rows.push(['Measurement','Value (inches)']);
    Object.entries(data).filter(([,v])=>v!==''&&v!=null).forEach(([k,v])=>rows.push([toLabel(k),v]));
    rows.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{wch:28},{wch:18}];
  XLSX.utils.book_append_sheet(wb,ws,'Measurements');
  XLSX.writeFile(wb,`${customerName.replace(/\s+/g,'_')}_measurements.xlsx`);
}
