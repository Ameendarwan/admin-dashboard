export interface OrderItemForPrint {
  name: string;
  sku: string;
  quantity: number;
}

export interface OrderItemsPrintLabels {
  title: string;
  no: string;
  name: string;
  sku: string;
  quantity: string;
}

function escapeHtml(text: string): string {
  const el = document.createElement('div');
  el.textContent = text;
  return el.innerHTML;
}

export function buildOrderItemsPrintHtml(
  orderId: string,
  items: OrderItemForPrint[],
  labels: OrderItemsPrintLabels,
): string {
  const rows = items
    .map(
      (item, index) =>
        `<tr>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${escapeHtml(item.sku)}</td>
          <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${item.quantity}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 16px; font-weight: 600; display: flex; justify-content: space-between;}
    h1 .order-id { font-size: 14px; font-weight: normal; color: #6b7280;}
    table { border-collapse: collapse; width: 100%; }
    th { background: #f3f4f6; padding: 8px 12px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600; }
  </style>
</head>
<body>
  <h1>${escapeHtml(labels.title)} <span class="order-id">${escapeHtml(orderId)}</span></h1>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(labels.no)}</th>
        <th>${escapeHtml(labels.name)}</th>
        <th>${escapeHtml(labels.sku)}</th>
        <th>${escapeHtml(labels.quantity)}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}
