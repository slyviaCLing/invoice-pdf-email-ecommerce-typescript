import { z } from "zod";
import { infraiRequest } from "./infrai_client.js";

export const PDF_GENERATE_CAPABILITY = "pdf.generate";

export const checkoutBody = z.object({
  orderId: z.string().min(1), customerEmail: z.string().email(), customerName: z.string().min(1),
  items: z.array(z.object({ name: z.string(), quantity: z.number().int().positive(), unitPrice: z.number().nonnegative() })).min(1)
});
export type Checkout = z.infer<typeof checkoutBody>;

export async function issueInvoice(input: unknown) {
  const order = checkoutBody.parse(input);
  const total = order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const html = `<h1>Invoice ${order.orderId}</h1><p>Customer: ${order.customerName}</p><ul>${order.items.map((i) => `<li>${i.quantity} x ${i.name} - ${(i.quantity * i.unitPrice).toFixed(2)}</li>`).join("")}</ul><strong>Total: ${total.toFixed(2)}</strong>`;
  const pdf = await infraiRequest<{ pdf_id: string; url: string; size_bytes: number; page_count: number; sha256: string; created_at: string; source: string; retention_days: number }>("/v1/pdf/generate", { html, page_size: "A4", orientation: "portrait", store: false });
  const email = await infraiRequest<{ message_id: string }>("/v1/email/send", { to: order.customerEmail, subject: `Invoice ${order.orderId}`, html: `<p>Your order is confirmed.</p>${html}<p><a href="${pdf.url}">Download your invoice</a> (${pdf.size_bytes} bytes).</p>` });
  return { orderId: order.orderId, status: "invoiced", messageId: email.message_id, total };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = { orderId: "order-1001", customerEmail: "chenhua@changba.com", customerName: "Ada", items: [{ name: "Desk lamp", quantity: 1, unitPrice: 49.9 }] };
  issueInvoice(sample).then(console.log).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
