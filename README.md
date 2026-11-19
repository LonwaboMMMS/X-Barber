# X Barbershop

A static, GitHub-hosted haircut booking website with a Cloudflare Worker API and Cloudflare D1 database planned for shared availability.

## Haircut menu
- Fade — R50
- Fade with Dye — R70
- Both services take 45 minutes.

Prices and service names are currently defined in `booking.js` and seeded into D1 by the initial migration.

## Pages
- `index.html` — home
- `booking.html` — service, barber, date and time selection
- `cart.html` — review and remove appointments
- `checkout.html` — customer details and payment handoff
- `gallery.html` — public haircut photo gallery

## Cloudflare backend
- `wrangler.jsonc` — Worker and D1 binding configuration.
- `worker/index.js` — API, including shared appointment availability.
- `worker/migrations/0001_initial_schema.sql` — services, barbers and appointments tables.
- `config.js` — public Worker URL configuration. Set `apiBaseUrl` to the deployed Worker URL after deployment. Never put secrets in this file.

The D1 database is named `xbarber-db`. Apply the initial migration with Wrangler before deploying the Worker:

```sh
npx wrangler d1 migrations apply xbarber-db --remote
npx wrangler deploy
```

The availability endpoint is `GET /api/availability?date=YYYY-MM-DD&barber_id=barber1`. The booking page uses this endpoint when `apiBaseUrl` is configured. Until the Worker is deployed and configured, the page continues using its local demo availability.

## Booking and payment status
Shared availability is read from D1. The current checkout/payment flow is not yet connected to the backend, so appointments are not yet created or confirmed in D1. Before accepting live bookings, implement server-side booking creation, slot-conflict validation, pending-payment expiry and verified payment notifications. Never rely on browser-only checks to prevent double bookings.

## Barbers and appointment times
Barber names are currently defined in `booking.js` as Barber 1 and Barber 2. Appointments begin at 12:00 PM, with 45-minute slots through 4:30 PM. Each appointment reserves 45 minutes.

## Customer photo gallery
The gallery is static and uses photos stored in the repository's `Images/` folder. Upload each haircut photo to that folder, then add its path, caption and alt text to the `photos` array in `gallery.js`. Use the exact filename and capitalisation. Commit and push the changes; GitHub Pages will publish them. Only add photos you have permission to publish.

## Deployment and PWA
GitHub Actions deploys the website to GitHub Pages when changes are pushed to `main`. The site includes an installable PWA shell and service worker.
