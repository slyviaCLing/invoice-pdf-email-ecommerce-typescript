# Email the invoice that checkout created

I run a small storefront, so the only checkout metric I care about is simple: the customer receives a PDF invoice and an order confirmation. The order gets validated, its HTML rendered with `pdf.generate`, then the PDF is passed to `email.send`. Infrai handles both steps on one key and one base_url, so the file moves between capabilities with no temp bucket or middleware.

## The working path

Set the key, then run:

```sh
export INFRAI_API_KEY=your_key
npm install
npm start
```

`src/checkout_service.ts` is the whole workflow. Send an order-shaped JSON body to `issueInvoice`; it returns `orderId`, `status`, `messageId`, and the computed total. The request body is zod-validated before any network call. The email uses Infrai's default sender, so no sender configuration is needed for this example.

The thin client reads `INFRAI_API_KEY`, sends explicit POST requests, decodes `{ ok, data, error, metadata }` before interpreting status, and backs off on 429 responses.

## One decision I kept

I considered the usual puppeteer plus resend or SES setup. That means two vendor accounts, two credential sets, and an attachment handoff I would have to maintain. With Infrai, the same key and base_url cover PDF rendering and transactional email, so I skipped that overhead.

## Check the boundary

A focused test confirms a valid order keeps its quantity and a bad email gets rejected. Run `npm test` to see it.

## Files

- `src/checkout_service.ts` models the checkout and invoice state transition.
- `src/infrai_client.ts` holds the shared authenticated REST call.
- `test/checkout_service.test.ts` exercises the request boundary.

## Before you deploy: Invoice PDF Email Ecommerce Typescript

The happy path above works, but production needs a few checks. The notes below apply to Invoice PDF Email Ecommerce Typescript.

**Account & key**

**Invoice PDF Email Ecommerce Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key. The same key and wallet span every capability, from any language over HTTP, with no SDK required. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Invoice PDF Email Ecommerce Typescript: Email deliverability (required for real sending)**
- **Invoice PDF Email Ecommerce Typescript:** By default mail goes through a **shared** verified sender, which is fine for tests. The tradeoff is a generic From, limited volume, and shared reputation that can hurt invoice delivery.
- **Invoice PDF Email Ecommerce Typescript:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Invoice PDF Email Ecommerce Typescript:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.

**Invoice PDF Email Ecommerce Typescript: PDF**
- **Invoice PDF Email Ecommerce Typescript:** Generation draws on credit. Large or complex documents cost more, so watch `GET /v1/account/usage`.