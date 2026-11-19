# X Barbershop

Separate home, booking, cart and checkout pages for a two-barber haircut booking system.

## Appointment schedule
- First appointment: 12:00 PM.
- New appointment every 45 minutes: 12:00, 12:45, 1:30, 2:15, 3:00, 3:45, 4:30 PM.
- Each booking reserves 45 minutes. Last slot ends at 5:15 PM.
- Each barber has a separate availability calendar.

## Pages
- index.html — home
- booking.html — service, barber, date and time selection
- cart.html — review and remove bookings
- checkout.html — customer details and payment handoff

## Demo
Without Supabase configuration, sample services/barbers are shown and the cart is stored in browser local storage. Demo bookings do not sync across customers and are not suitable for real bookings.

## Supabase
Create a project, run supabase/schema.sql in SQL Editor, then copy config.js.example to config.js and add the project URL and anon/publishable key. Never expose the service-role key. Edit service prices and barber names in Supabase.

## Payment integration
Checkout is wired to POST customer and cart details to the configured checkoutEndpoint. The secure backend must create the payment session and return { checkoutUrl }. Store gateway secrets only server-side and confirm payments through a verified webhook. The gateway is not connected yet.

Before launch, configure business hours, holidays, admin management, cancellations, expiry of unpaid reservations, customer notifications and privacy/legal pages.

## Installable PWA
The site includes a web app manifest, service worker, offline-cached app shell and an install button. Deploy over HTTPS (Cloudflare Pages provides HTTPS). Supported browsers show their native install prompt; on iPhone/iPad, use Safari Share → Add to Home Screen. Booking data, Supabase calls and payment still require an internet connection. The PWA must be served from the deployed site, not opened as a local file.
