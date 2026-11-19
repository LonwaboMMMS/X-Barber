# X Barber Shop

A mobile-friendly haircut booking website for two barbers. Customers choose a service, barber, date and available time, then enter their contact details.

## What's included
- Service menu with editable prices and appointment durations.
- Two barber profiles (placeholder names).
- Date picker and time-slot selection.
- Booking summary and customer details form.
- Supabase database integration with server-side overlap checking to prevent double-booking.
- Payment step intentionally left as a clearly labelled placeholder until the payment gateway is selected and credentials are supplied.

## Preview mode
Open `index.html` in a browser. Without Supabase credentials, the site runs in demo mode and uses browser storage. Demo bookings are only stored in that browser and are NOT shared between customers. Do not use demo mode for live appointments.

## Connect Supabase
1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/schema.sql`.
3. Copy `config.js.example` to `config.js`.
4. Add the project URL and anon/publishable key to `config.js`. Never use the service-role key in the website.
5. Deploy the repository using GitHub Pages or another static host. Keep `config.js` private to your deployment and do not commit real credentials.
6. Edit service names, prices, durations and barber names in the Supabase Table Editor.

The database booking function checks for overlapping appointments on the selected barber before creating a pending-payment booking. Payment confirmation, automatic expiry/refunds, admin management, barber working hours and customer notifications still need to be connected before production launch.

## Before going live
- Choose the payment provider and implement its server-side checkout/webhook. Never trust a payment success message sent only by the browser.
- Set opening hours, days off, holidays and booking lead-time rules.
- Add an authenticated admin dashboard for managing services, barbers, schedules and bookings.
- Configure email/SMS confirmations and privacy/legal pages.
- Test concurrent bookings, cancellations and payment failures.