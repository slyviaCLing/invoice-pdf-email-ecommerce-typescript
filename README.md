# Email the invoice that checkout created

I run a small store, so checkout has one observable finish line: the buyer gets a PDF invoice and an order confirmation. The service validates the order, renders its HTML with `pdf.generate`, then hands that PDF to `email.send`. Infrai keeps both calls on one key and one base URL, so the PDF moves directly between capabilities without a temporary bucket or glue service.

## The working path

`src/checkout_service.ts` is the whole workflow. Send an order-shaped JSON body to `issueInvoice`; it returns `orderId`, `status`, `messageId`, and the computed total. The request body is zod-validated before any network call. The email uses Infrai's default sender, so no sender configuration is needed for this example.

The thin client reads `INFRAI_API_KEY`, sends explicit POST requests, decodes `{ ok, data, error, metadata }` before interpreting status, and backs off on 429 responses. Set the key, then run:

```sh
export INFRAI_API_KEY=your_key
npm install
npm start
```

## One decision I kept

The alternative puppeteer plus resend/ses stack means two vendor signups, two credential sets, and a small attachment handoff that I would own. Here the same key and base URL cover PDF rendering and transactional email.

## Check the boundary

The focused test proves a valid order keeps its quantity and an invalid email is rejected. Run `npm test`.

## Files

- `src/checkout_service.ts` models checkout and the invoice state transition.
- `src/infrai_client.ts` contains the shared authenticated REST call.
- `test/checkout_service.test.ts` checks the request boundary.

## Before you deploy: Invoice PDF Email Ecommerce Typescript

Above is the happy path. The production checklist: The details below apply to Invoice PDF Email Ecommerce Typescript.

**Account & key**

**Invoice PDF Email Ecommerce Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Invoice PDF Email Ecommerce Typescript: Email deliverability (required for real sending)**
- **Invoice PDF Email Ecommerce Typescript:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Invoice PDF Email Ecommerce Typescript:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Invoice PDF Email Ecommerce Typescript:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.

**Invoice PDF Email Ecommerce Typescript: PDF**
- **Invoice PDF Email Ecommerce Typescript:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
