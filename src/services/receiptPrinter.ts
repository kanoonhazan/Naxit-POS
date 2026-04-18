import type {Receipt, StoreSettings} from '../types';

/**
 * Generates ESC/POS compatible receipt text.
 * This can be sent directly to a thermal printer via Bluetooth.
 */
export function formatReceiptText(
  receipt: Receipt,
  settings: StoreSettings,
): string {
  const ESC = '\x1B';
  const GS = '\x1D';
  const LF = '\n';

  const BOLD_ON = `${ESC}E\x01`;
  const BOLD_OFF = `${ESC}E\x00`;
  const CENTER = `${ESC}a\x01`;
  const LEFT = `${ESC}a\x00`;
  const DOUBLE_HEIGHT = `${GS}!\x10`;
  const NORMAL_SIZE = `${GS}!\x00`;
  const CUT = `${GS}V\x01`;

  const DIVIDER = '--------------------------------';
  const WIDTH = 32;

  function padLine(left: string, right: string): string {
    const gap = WIDTH - left.length - right.length;
    return left + ' '.repeat(Math.max(gap, 1)) + right;
  }

  function formatAmount(amount: number): string {
    return `${settings.currency} ${amount.toLocaleString()}`;
  }

  const lines: string[] = [];

  // Header
  lines.push(CENTER);
  lines.push(BOLD_ON + DOUBLE_HEIGHT);
  lines.push(settings.storeName);
  lines.push(NORMAL_SIZE + BOLD_OFF);
  lines.push(settings.storeSubtitle);
  lines.push('');
  lines.push(LEFT);
  lines.push(DIVIDER);

  // Receipt info
  lines.push(padLine('Receipt:', receipt.number));
  lines.push(
    padLine(
      'Date:',
      new Date(receipt.issuedAt).toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    ),
  );
  lines.push(
    padLine(
      'Time:',
      new Date(receipt.issuedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    ),
  );
  lines.push(DIVIDER);

  // Items
  receipt.items.forEach(item => {
    lines.push(BOLD_ON + item.name + BOLD_OFF);
    lines.push(
      padLine(
        `  ${item.quantity} x ${formatAmount(item.price)}`,
        formatAmount(item.quantity * item.price),
      ),
    );
  });

  lines.push(DIVIDER);

  // Totals
  lines.push(padLine('Subtotal:', formatAmount(receipt.subtotal)));

  if (receipt.discount > 0) {
    const dAmt = receipt.discountType === 'percentage'
      ? Math.round((receipt.subtotal * receipt.discount) / 100)
      : receipt.discount;
    lines.push(padLine(`Discount (${receipt.discountType === 'percentage' ? `${receipt.discount}%` : 'FIXED'}):`, `-${formatAmount(dAmt)}`));
  }

  if (receipt.tax > 0) {
    lines.push(padLine('Tax:', formatAmount(receipt.tax)));
  }

  lines.push(BOLD_ON);
  lines.push(padLine('TOTAL:', formatAmount(receipt.total)));
  lines.push(BOLD_OFF);
  lines.push('');
  lines.push(padLine('Paid:', formatAmount(receipt.paidAmount)));
  lines.push(padLine('Change:', formatAmount(receipt.changeDue)));
  lines.push(padLine('Method:', receipt.paymentMethod.toUpperCase()));

  lines.push(DIVIDER);

  // Footer
  lines.push(CENTER);
  lines.push('Thank you for your purchase!');
  lines.push('All data stored offline on device.');
  lines.push('');
  lines.push(CUT);

  return lines.join(LF);
}

/**
 * Plain text version for on-screen display.
 */
export function formatReceiptPlainText(
  receipt: Receipt,
  settings: StoreSettings,
): string {
  const DIVIDER = '--------------------------------';
  const WIDTH = 32;

  function padLine(left: string, right: string): string {
    const gap = WIDTH - left.length - right.length;
    return left + ' '.repeat(Math.max(gap, 1)) + right;
  }

  function formatAmount(amount: number): string {
    return `${settings.currency} ${amount.toLocaleString()}`;
  }

  const lines: string[] = [];

  lines.push(settings.storeName);
  lines.push(settings.storeSubtitle);
  lines.push(DIVIDER);
  lines.push(padLine('Receipt:', receipt.number));
  lines.push(
    padLine(
      'Date:',
      new Date(receipt.issuedAt).toLocaleDateString(),
    ),
  );
  lines.push(DIVIDER);

  receipt.items.forEach(item => {
    lines.push(item.name);
    lines.push(
      padLine(
        `  ${item.quantity} x ${formatAmount(item.price)}`,
        formatAmount(item.quantity * item.price),
      ),
    );
  });

  lines.push(DIVIDER);
  lines.push(padLine('TOTAL:', formatAmount(receipt.total)));
  lines.push(padLine('Method:', receipt.paymentMethod.toUpperCase()));
  lines.push(DIVIDER);
  lines.push('Thank you!');

  return lines.join('\n');
}

/**
 * Mock Bluetooth printer interface.
 * In production, replace with react-native-thermal-receipt-printer calls.
 */
export async function printReceipt(escPosText: string): Promise<boolean> {
  // Mock implementation — simulates sending to a Bluetooth thermal printer
  console.log('[PRINTER] Sending receipt to Bluetooth printer...');
  console.log('[PRINTER] ESC/POS data length:', escPosText.length, 'bytes');

  return new Promise(resolve => {
    setTimeout(() => {
      console.log('[PRINTER] Receipt printed successfully (mock).');
      resolve(true);
    }, 800);
  });
}

/**
 * Generates ESC/POS commands for a product QR label.
 */
export function formatQrLabel(
  product: Product,
  count: number,
): string {
  const ESC = '\x1B';
  const GS = '\x1D';
  const LF = '\n';
  const GS_QR = `${GS}k`; // Start of QR command

  const CENTER = `${ESC}a\x01`;
  const BOLD_ON = `${ESC}E\x01`;
  const BOLD_OFF = `${ESC}E\x00`;
  const CUT = `${GS}V\x01`;

  const labelParts: string[] = [];

  for (let i = 0; i < count; i++) {
    labelParts.push(CENTER);
    
    // QR Code Placeholder (In real ESC/POS, this involves complex multi-step commands)
    // For this mock, we represent the QR command sequence
    labelParts.push(GS_QR + '\x06\x03\x08' + product.id); 
    
    labelParts.push(LF);
    labelParts.push(BOLD_ON + product.name + BOLD_OFF);
    labelParts.push(LF);
    labelParts.push(product.code);
    labelParts.push(LF + LF);
    labelParts.push(CUT);
  }

  return labelParts.join('');
}

/**
 * Test print for printer setup validation.
 */
export async function testPrint(storeName: string): Promise<boolean> {
  const testText = [
    storeName,
    '--------------------------------',
    'PRINTER TEST',
    `Time: ${new Date().toLocaleTimeString()}`,
    '--------------------------------',
    'If you see this, the printer is',
    'connected and working properly.',
    '--------------------------------',
    '',
  ].join('\n');

  return printReceipt(testText);
}
