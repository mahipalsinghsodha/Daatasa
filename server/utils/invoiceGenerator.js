const PDFDocument = require('pdfkit');

function generateInvoiceBuffer(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      generateHeader(doc);
      generateCustomerInformation(doc, invoice);
      generateInvoiceTable(doc, invoice);
      generateFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function generateHeader(doc) {
  doc
    .fillColor('#1B2F6E')
    .fontSize(26)
    .text('DhaniFresh', 50, 50)
    .fontSize(10)
    .fillColor('#64748B')
    .text('Pure Bilona A1 & A2 Ghee', 50, 80)
    .text('India', 50, 95)
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor('#334155')
    .fontSize(20)
    .text('INVOICE', 50, 140);

  generateHr(doc, 165);

  const customerInformationTop = 180;

  doc
    .fontSize(10)
    .text('Invoice Number:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.invoiceNumber, 150, customerInformationTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    
    .text('Billed To:', 300, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.userName, 300, customerInformationTop + 15)
    .font('Helvetica')
    .text(`Payment: ${invoice.paymentMethod}`, 300, customerInformationTop + 30)
    .moveDown();

  generateHr(doc, 230);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 270;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Description',
    'Unit Price',
    'Quantity',
    'Line Total'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  let position = 0;
  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    position = invoiceTableTop + (i + 1) * 30;
    
    // Safely calculate line total
    const lineTotal = (item.price * item.quantity).toFixed(2);
    
    generateTableRow(
      doc,
      position,
      item.name,
      'Premium Ghee',
      `Rs. ${Number(item.price).toFixed(2)}`,
      item.quantity,
      `Rs. ${lineTotal}`
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    '',
    'Total:',
    '',
    `Rs. ${Number(invoice.totalPrice).toFixed(2)}`
  );
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .fillColor('#94A3B8')
    .text(
      'Thank you for your business. For any questions, please contact our support.',
      50,
      700,
      { align: 'center', width: 500 }
    );
}

function generateTableRow(doc, y, item, description, unitCost, quantity, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y, { width: 150, align: 'left' })
    .text(description, 200, y, { width: 150, align: 'left' })
    .text(unitCost, 350, y, { width: 90, align: 'right' })
    .text(quantity.toString(), 440, y, { width: 40, align: 'right' })
    .text(lineTotal, 480, y, { width: 70, align: 'right' });
}

function generateHr(doc, y) {
  doc
    .strokeColor('#E2E8F0')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + '/' + month + '/' + day;
}

module.exports = { generateInvoiceBuffer };
