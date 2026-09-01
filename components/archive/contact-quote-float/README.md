# Contact quote typewriter (archived)

VT323 typewriter that cycles quotes below the LED contact strip.

## Restore

1. Copy `ContactQuoteFloat.jsx` to `components/ContactQuoteFloat.jsx`.
2. Import styles from `contact-quote-float.css` into `app/globals.css` (or paste the rules).
3. In `components/Desktop.jsx`:
   - Import `ContactQuoteFloat`.
   - Compute `contactQuoteW` (~2.45× banner width) and `contactClusterLeft` to center the wider quote under the strip.
   - Wrap `ContactPorts` in a `contact-ports` container and render `<ContactQuoteFloat />` below the nav.

Quote copy lives in `data/quotes.js`.
