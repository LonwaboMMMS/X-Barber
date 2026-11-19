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
- checkout.html — customer details, optional gallery consent and payment handoff
- gallery.html — public haircut photo gallery

## Demo
Without Supabase configuration, sample services/barbers are shown and the cart is stored in browser local storage. Demo bookings do not sync across customers and are not suitable for real bookings.

## Supabase
Create a project, run supabase/schema.sql in SQL Editor, then copy config.js.example to config.js and add the project URL and anon/publishable key. Never expose the service-role key. Edit service prices and barber names in Supabase.

## Customer photo gallery
Run the updated `supabase/schema.sql`. It creates the `barber-gallery` public image bucket and `gallery_photos` table. Upload approved haircut photos to that bucket in the Supabase dashboard, then add their public image URLs, captions and alt text to `gallery_photos` and set `is_published` to true. Only publish photos where the customer has explicitly opted in. The checkout choice is optional and unchecked by default; it is sent to the secure checkout endpoint as `galleryConsent`. The backend must pass it to `create_booking` as `p_gallery_consent` so the customer choice is stored in `bookings.gallery_consent`.

## Payment integration
Checkout is wired to POST customer and cart details to the configured checkoutEndpoint. The secure backend must create the payment session and return { checkoutUrl }. Store gateway secrets only server-side and confirm payments through a verified webhook. The gateway is not connected yet.

Before launch, configure business hours, holidays, admin management, cancellations, expiry of unpaid reservations, customer notifications and privacy/legal pages.

## Installable PWA
The site includes a web app manifest, service worker, offline-cached app shell and an install button. Deploy over HTTPS (Cloudflare Pages provides HTTPS). Supported browsers show their native install prompt; on iPhone/iPad, use Safari Share → Add to Home Screen. Booking data, Supabase calls and payment still require an internet connection. The PWA must be served from the deployed site, not opened as a local file.
