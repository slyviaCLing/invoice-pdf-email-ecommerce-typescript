import { checkoutBody } from "../src/checkout_service.js";
const valid = { orderId: "o-1", customerEmail: "a@example.com", customerName: "A", items: [{ name: "Book", quantity: 2, unitPrice: 10 }] };
if (checkoutBody.parse(valid).items[0].quantity !== 2) throw new Error("quantity decision failed");
if (checkoutBody.safeParse({ ...valid, customerEmail: "bad" }).success) throw new Error("invalid email accepted");
console.log("checkout boundary ok");
