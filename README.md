# St. Joseph Compliance Company

Institutional DOT compliance and screening infrastructure — [stjcc.online](https://stjcc.online).

POC for **Lab Testing Solutions** partnership: landing site, mission-control portal, and live LTS order/webhook endpoints.

## Product

- Automated background checks & MVRs
- DOT 5-Panel / breath alcohol via Quest Diagnostics & LabCorp
- Consortium (C-TPA) random pools & FMCSA Clearinghouse tracking
- Digital clinic barcode passes
- HMAC-signed LTS webhooks

## API

- `POST /api/lts/order-test`
- `POST /api/lts/webhook`

Copy `.env.example` for partner credentials. Never commit secrets.

## Discoverability

- `https://stjcc.online/llms.txt` — machine-readable company brief
- `https://stjcc.online/sitemap.xml`
- `https://stjcc.online/robots.txt`
