# X Barbershop

A static, GitHub-hosted haircut booking website. The site currently uses repository files for its code, services, prices, barbers and gallery images. A shared online booking database has not been connected yet.

## Haircut menu
- Fade — R50
- Fade with Dye — R70
- Both services take 45 minutes.

Prices and service names are defined directly in `booking.js`.

## Pages
- `index.html` — home
- `booking.html` — service, barber, date and time selection
- `cart.html` — review and remove appointments
- `checkout.html` — customer details and payment handoff
- `gallery.html` — public haircut photo gallery

## Booking storage limitation
The site is hosted as a static GitHub Pages website. It saves the cart and demo booked slots in the visitor's browser using localStorage. This means bookings are not shared between customers, devices or barbers, and it cannot reliably prevent two customers from choosing the same slot. GitHub Pages does not let public website visitors safely write booking records directly into repository files.

The planned shared booking system will use a server-side API and database. Booking validation and double-booking protection must happen on the server, not only in browser JavaScript. Never place private API credentials or repository write tokens in public website files.

## Barbers and appointment times
Barber names are currently defined in `booking.js` as Barber 1 and Barber 2. Update those labels in that file when the names are confirmed. Appointments begin at 12:00 PM, with 45-minute slots through 4:30 PM. Each appointment reserves 45 minutes.

## Customer photo gallery
The gallery is static and uses photos stored in the repository's `Images/` folder. Upload each haircut photo to that folder, then add its path, caption and alt text to the `photos` array in `gallery.js`. Use the exact filename and capitalisation. Commit and push the changes; GitHub Pages will publish them. Only add photos you have permission to publish.

## Payments
The payment gateway is not connected yet. A secure payment integration requires a server-side endpoint to create checkout sessions and verify payment notifications. Do not put private payment credentials in repository JavaScript or public files.

## Deployment and PWA
GitHub Actions deploys the site to GitHub Pages when changes are pushed to `main`. The site includes an installable PWA shell and service worker.
