# St. Joseph Compliance Company

Institutional DOT compliance and screening infrastructure — [stjcc.online](https://stjcc.online).

Independent DOT compliance software platform: public services site, restricted owner workspace, and generic compliance REST endpoints.

## Product

- Proprietary compliance engine for automated workflows
- Automated random pool management and FMCSA Clearinghouse tracking
- Real-time MVR checks and background screening
- DOT drug and alcohol testing through a SAMHSA-certified lab network
- Digital clinic pass generation
- Signed lab-result callbacks through a certified MRO network

## API

- `POST /api/v1/orders/dispatch`
- `POST /api/v1/webhooks/lab-results`

Copy `.env.example` for local configuration. Never commit secrets.

## Discoverability

- `https://stjcc.online/llms.txt` — machine-readable company brief
- `https://stjcc.online/sitemap.xml`
- `https://stjcc.online/robots.txt`
