# ROUTE — Online Bus Ticket Booking System

A responsive, zero-server bus ticket booking web application developed as an academic college project demonstration for the Department of BCA.

---

## Quick Start (Run Without a Server)

**No server, Node.js, Python, npm, build tools, or database required.**

1. Simply **double-click `index.html`** in this folder to launch the website directly in any modern web browser (Chrome, Edge, Firefox, Safari) using the `file://` protocol.
2. Alternatively, right-click `index.html` and choose **Open with > Your preferred browser**.

---

## Application Pages & Flow

1. **`index.html` (Home Page)**: Route origin & destination search, journey date selection, city-swap tool, popular quick-select routes, highlights, and platform benefits.
2. **`buses.html` (Search Buses)**: Dynamic bus listings, real-time filters (departure time, sleeper/seater types, amenities, price range slider), and multi-criteria sorting (recommended, lowest fare, departure time, top rated).
3. **`seats.html` (Seat Selection)**: Interactive bus cabin layout with lower/upper deck views, real-time seat availability (available, selected, occupied), 6-seat booking cap, and instant fare calculation.
4. **`checkout.html` (Passenger & Payment)**: Dynamic passenger details roster (one form per selected seat with validation), contact details, promo codes (`ROUTE10` for 10% off, `FIRSTBUS` for ₹150 off), and simulated payment method selection (UPI, Card, Net Banking, Wallet).
5. **`ticket.html` (Booking Confirmation & My Tickets)**: Realistic demo e-ticket receipt featuring a unique booking ID, route details, passenger roster, fare summary, procedural SVG QR code, and actions to download an offline HTML receipt, print/save as PDF, copy booking ID, or share. Also serves as the "My Tickets" persistent archive.
6. **`project-team.html` (Project Team & Academic Credits)**: Academic capstone demonstration details, development team roster (Jenil Banavani and team), faculty project guide acknowledgment, and platform specifications.

*(Note: `home.html` and `my-tickets.html` are included as convenient aliases to ensure all external links and bookmarks resolve seamlessly).*

---

## Architecture & Technical Highlights

- **Pure Frontend**: 100% Vanilla HTML5, CSS3, and JavaScript.
- **Zero Server Dependencies**: Operates completely under `file://` with no `fetch()` restrictions, relative paths for all assets, and zero backend services.
- **Resilient Local Storage**: Retains booking progress and saved receipts in browser storage (`localStorage` with `sessionStorage` and in-memory fallbacks).
- **Academic Demo Notice**: All bookings, payment options, and receipts are simulated demonstrations for college evaluation. No real transactions take place.
- **Responsive & Accessible**: Seamless editorial layout across desktop, tablet, and mobile viewport widths.
