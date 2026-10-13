# Public demo booking

The public `/book-demo` page uses Calendly's inline event scheduler. The current event type is `https://calendly.com/contact-theaipods/30min`. This URL is the application default and is also listed in `web/.env.example`. To change it, set `NEXT_PUBLIC_CALENDLY_URL` in `web/.env.local` or the deployment environment and restart or rebuild Next.js. Configure availability, duration, invitee questions, confirmation emails, calendar connections, and meeting location in Calendly.

The page loads Calendly's official widget script, passes the selected demo focus through UTM content, and treats a booking as confirmed only after receiving Calendly's `calendly.event_scheduled` event from a Calendly origin. It also provides an external Calendly link if the embedded scheduler fails. With an invalid configured URL, the page shows a setup message and does not offer a false reservation.

The existing `/api/demo/*` internal scheduler endpoints are separate legacy/internal functionality. The public Calendly flow does not create records through them. Page illustrations and tool logos are examples and do not connect accounts.
