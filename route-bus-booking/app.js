(() => {
  'use strict';

  /* ==========================================================================
     ROUTE — Online Bus Ticket Booking System
     Vanilla JavaScript Core Application (Zero Server Dependency)
     ========================================================================== */

  const STORE = 'routeBookingDemoV1';
  const defaultTrip = { from: 'Ahmedabad', to: 'Mumbai', date: '2026-10-15' };

  const buses = [
    {
      id: 'shree',
      operator: 'Shree Travels',
      rating: '4.5',
      reviews: '2.1K',
      depart: '06:00 AM',
      arrive: '02:30 PM',
      duration: '8h 30m',
      start: 'Navrangpura Central',
      end: 'Borivali Highway',
      fare: 1200,
      type: 'AC Sleeper',
      amenities: ['AC', 'WiFi', 'Charging', 'Live Tracking'],
      image: 'assets/coach-collage.svg',
      tag: 'Popular',
      seats: 32
    },
    {
      id: 'vrl',
      operator: 'VRL Travels',
      rating: '4.2',
      reviews: '1.8K',
      depart: '08:15 AM',
      arrive: '05:25 PM',
      duration: '9h 10m',
      start: 'Gita Mandir Hub',
      end: 'Dadar TT Circle',
      fare: 1350,
      type: 'AC Seater',
      amenities: ['AC', 'Charging', 'Blanket'],
      image: 'assets/coach-collage.svg',
      tag: 'Best value',
      seats: 40
    },
    {
      id: 'neeta',
      operator: 'Neeta Travels',
      rating: '4.3',
      reviews: '920',
      depart: '10:30 AM',
      arrive: '07:15 PM',
      duration: '8h 45m',
      start: 'Naroda Patiya',
      end: 'Andheri East',
      fare: 1150,
      type: 'AC Sleeper',
      amenities: ['AC', 'WiFi', 'Charging'],
      image: 'assets/coach-collage.svg',
      tag: 'Lowest fare',
      seats: 32
    },
    {
      id: 'orange',
      operator: 'Orange Travels',
      rating: '4.1',
      reviews: '640',
      depart: '11:45 PM',
      arrive: '07:15 AM',
      duration: '7h 30m',
      start: 'Naroda Intercity',
      end: 'Bandra Terminus',
      fare: 1400,
      type: 'AC Sleeper',
      amenities: ['AC', 'WiFi', 'Live Tracking'],
      image: 'assets/coach-collage.svg',
      tag: 'Night journey',
      seats: 36
    },
    {
      id: 'patel',
      operator: 'Patel Tours & Travels',
      rating: '4.4',
      reviews: '1.2K',
      depart: '09:00 PM',
      arrive: '05:20 AM',
      duration: '8h 20m',
      start: 'Geeta Mandir Terminal',
      end: 'Sion Junction',
      fare: 1280,
      type: 'Non-AC Sleeper',
      amenities: ['Charging', 'Blanket'],
      image: 'assets/coach-collage.svg',
      tag: 'Comfort pick',
      seats: 30
    }
  ];

  const paymentLabels = {
    upi: 'UPI (Demo Simulation)',
    card: 'Debit / Credit Card (Demo)',
    netbanking: 'Net Banking (Demo)',
    wallet: 'Mobile Wallet (Demo)'
  };

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Resilient multi-tier browser storage with fallback
  let memoryFallback = null;

  function getFallback() {
    return {
      trip: { ...defaultTrip },
      bus: buses[0],
      seats: [],
      passengers: [],
      contact: { phone: '', email: '' },
      payment: 'upi',
      offer: '',
      booking: null,
      latestBooking: null,
      savedBookings: []
    };
  }

  const read = () => {
    let raw = null;
    try {
      raw = localStorage.getItem(STORE);
    } catch (e) {
      // localStorage may throw SecurityError on restricted file://
    }
    if (!raw) {
      try {
        raw = sessionStorage.getItem(STORE);
      } catch (e) {}
    }
    if (!raw && memoryFallback) {
      raw = memoryFallback;
    }

    try {
      const parsed = raw ? JSON.parse(raw) : {};
      return { ...getFallback(), ...parsed };
    } catch {
      return getFallback();
    }
  };

  const save = data => {
    const serialized = JSON.stringify(data);
    memoryFallback = serialized;
    try {
      localStorage.setItem(STORE, serialized);
    } catch (e) {}
    try {
      sessionStorage.setItem(STORE, serialized);
    } catch (e) {}
  };

  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

  const prettyDate = value => {
    if (!value) return 'Wed, 15 Oct 2026';
    try {
      const d = new Date(value + 'T12:00:00');
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return value;
    }
  };

  function formatDateTime(isoString) {
    const d = isoString ? new Date(isoString) : new Date();
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ', ' + d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function generateBookingId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 5; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `ROUTE-${y}${m}${d}-${rand}`;
  }

  const tripText = trip => `${trip?.from || defaultTrip.from} → ${trip?.to || defaultTrip.to}`;
  const selectedBus = data => data.bus || buses[0];
  const busThumb = (bus, cls = '') => `<div class="bus-thumb ${cls}"><img src="${bus?.image || 'assets/coach-collage.svg'}" alt="Coach bus graphic"></div>`;

  function flash(message, kind = 'success') {
    let toast = $('#route-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'route-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.className = `toast show ${kind}`;
    toast.textContent = message;
    clearTimeout(window.__routeToastTimer);
    window.__routeToastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function escapeAttr(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  /* ==========================================================================
     Navigation & Header Management
     ========================================================================== */

  function initNav() {
    const toggle = $('.menu-toggle');
    const nav = $('.nav-links');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });

      document.addEventListener('click', e => {
        if (!e.target.closest('.menu-toggle') && !e.target.closest('.nav-links')) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const currentPath = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.nav-links a').forEach(a => {
      a.classList.remove('active');
      const href = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
      if (
        (href === currentPath) ||
        ((currentPath === '' || currentPath === 'index.html' || currentPath === 'project-team.html') && (href === 'index.html' || href === 'project-team.html')) ||
        (currentPath === 'home.html' && href === 'home.html') ||
        ((currentPath === 'buses.html' || currentPath === 'seats.html' || currentPath === 'checkout.html') && href === 'buses.html') ||
        ((currentPath === 'ticket.html' || currentPath === 'my-tickets.html') && (href === 'ticket.html' || href === 'my-tickets.html'))
      ) {
        a.classList.add('active');
      }
    });
  }

  /* ==========================================================================
     Home Page: Search & Route Selection
     ========================================================================== */

  function initHome() {
    const form = $('#trip-search-form');
    if (!form) return;

    const data = read();
    const from = $('#from-city') || $('#from');
    const to = $('#to-city') || $('#to');
    const date = $('#travel-date') || $('#depart-date');
    const swap = $('#swap-cities') || $('#swap-routes');

    if (from && data.trip?.from) from.value = data.trip.from;
    if (to && data.trip?.to) to.value = data.trip.to;

    // Dynamically calculate today's date in local time for min attribute
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (date) {
      date.min = todayStr;
      if (data.trip?.date && data.trip.date >= todayStr) {
        date.value = data.trip.date;
      } else if (!date.value || date.value < todayStr) {
        date.value = todayStr;
      }
    }

    swap?.addEventListener('click', () => {
      if (!from || !to) return;
      const v = from.value;
      from.value = to.value;
      to.value = v;
    });

    $$('.route-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (from && chip.dataset.from) from.value = chip.dataset.from;
        if (to && chip.dataset.to) to.value = chip.dataset.to;
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!from || !to || !date) return;

      if (from.value === to.value) {
        flash('Source and destination cannot be the same city.', 'error');
        return;
      }
      if (!date.value) {
        flash('Please select your date of journey.', 'error');
        return;
      }

      data.trip = {
        from: from.value.trim(),
        to: to.value.trim(),
        date: date.value
      };
      data.seats = [];
      data.passengers = [];
      data.booking = null;
      save(data);
      location.href = 'buses.html';
    });
  }

  function toMinutes(time) {
    const [clock, period] = time.split(' ');
    let [hours, minutes] = clock.split(':').map(Number);
    hours = (hours % 12) + (period === 'PM' ? 12 : 0);
    return hours * 60 + minutes;
  }

  /* ==========================================================================
     Bus Results: Listings, Filters & Sorting
     ========================================================================== */

  function initBuses() {
    const list = $('#bus-list');
    if (!list) return;

    const data = read();
    const trip = data.trip || defaultTrip;

    if ($('#results-route')) $('#results-route').textContent = tripText(trip);
    if ($('#results-date')) $('#results-date').textContent = prettyDate(trip.date);
    if ($('#results-route-small')) $('#results-route-small').textContent = `${trip.from} → ${trip.to}`;

    const count = $('#bus-count');
    const fareRange = $('#fare-range');
    const filterChecks = $$('.filter-check');

    function render() {
      const typeSet = filterChecks.filter(c => c.checked).map(c => c.value);
      const maxFare = Number(fareRange?.value || 3000);
      const sort = $('#sort-buses')?.value || 'recommended';

      let filtered = buses.filter(b => b.fare <= maxFare);
      if (typeSet.length) filtered = filtered.filter(b => typeSet.includes(b.type));

      const times = $$('.time-check:checked').map(c => c.value);
      if (times.length) {
        filtered = filtered.filter(b => times.some(t => {
          const h = (Number(b.depart.split(':')[0]) % 12) + (b.depart.includes('PM') ? 12 : 0);
          return t === 'morning' ? h >= 5 && h < 12 : t === 'afternoon' ? h >= 12 && h < 18 : h >= 18 || h < 5;
        }));
      }

      const amenities = $$('.amenity-check:checked').map(c => c.value);
      if (amenities.length) filtered = filtered.filter(b => amenities.every(a => b.amenities.includes(a)));

      if (sort === 'price') filtered.sort((a, b) => a.fare - b.fare);
      if (sort === 'departure') filtered.sort((a, b) => toMinutes(a.depart) - toMinutes(b.depart));
      if (sort === 'rating') filtered.sort((a, b) => Number(b.rating) - Number(a.rating));

      if (count) count.textContent = `${filtered.length} ${filtered.length === 1 ? 'bus' : 'buses'} found`;

      if (!filtered.length) {
        list.innerHTML = `<div class="empty-state">
          <strong>No buses match those filters.</strong>
          Try clearing a filter or increasing your fare range.<br>
          <button class="btn secondary small" id="empty-clear" style="margin-top:14px">Clear filters</button>
        </div>`;
        $('#empty-clear')?.addEventListener('click', clearFilters);
        return;
      }

      list.innerHTML = filtered.map(b => `<article class="bus-card">
        ${busThumb(b)}
        <div class="bus-summary">
          <div class="bus-time"><span>${b.depart}</span><span class="small-arrow">→</span><span>${b.arrive}</span></div>
          <div class="bus-route-line"><span>${b.start}</span><span class="route-dash"></span><span>${b.end}</span></div>
          <div class="bus-meta"><span>◷ ${b.duration}</span><span>• ${b.type}</span></div>
        </div>
        <div class="bus-company-wrap">
          <div class="bus-company">${b.operator}</div>
          <div class="rating"><span class="stars">★</span> <b>${b.rating}</b> (${b.reviews})</div>
          <div class="bus-features">${b.amenities.slice(0, 3).map(a => `<span class="feature">${a}</span>`).join('')}</div>
          <div style="margin-top:7px"><span class="mini-tag ${b.tag === 'Lowest fare' ? 'blue-tag' : ''}">${b.tag}</span></div>
        </div>
        <div class="bus-price">
          <div><strong>${money(b.fare)}</strong><small>per seat</small></div>
          <button class="btn" data-bus="${b.id}">Select seats <span>→</span></button>
        </div>
      </article>`).join('');

      $$('[data-bus]', list).forEach(btn => btn.addEventListener('click', () => {
        const bus = buses.find(b => b.id === btn.dataset.bus) || buses[0];
        const fresh = read();
        fresh.bus = bus;
        fresh.seats = [];
        fresh.passengers = [];
        fresh.booking = null;
        save(fresh);
        location.href = 'seats.html';
      }));
    }

    function clearFilters() {
      filterChecks.forEach(c => c.checked = false);
      $$('.time-check,.amenity-check').forEach(c => c.checked = false);
      if (fareRange) fareRange.value = 3000;
      if ($('#fare-output')) $('#fare-output').textContent = '₹0 – ₹3,000';
      render();
    }

    $('#clear-filters')?.addEventListener('click', clearFilters);
    filterChecks.forEach(c => c.addEventListener('change', render));
    $$('.time-check,.amenity-check').forEach(c => c.addEventListener('change', render));
    fareRange?.addEventListener('input', () => {
      if ($('#fare-output')) $('#fare-output').textContent = `₹0 – ${money(fareRange.value)}`;
      render();
    });
    $('#sort-buses')?.addEventListener('change', render);
    $('#edit-search')?.addEventListener('click', () => { location.href = 'home.html#search'; });
    render();
  }

  /* ==========================================================================
     Seat Selection: Seat Map, Decks & Real-time Fare Calculation
     ========================================================================== */

  function initSeats() {
    const grid = $('#seat-grid');
    if (!grid) return;

    const data = read();
    let bus = selectedBus(data);
    if (!data.bus) {
      data.bus = bus;
      save(data);
    }

    const trip = data.trip || defaultTrip;
    if ($('#seat-route')) $('#seat-route').textContent = tripText(trip);
    if ($('#seat-date')) $('#seat-date').textContent = prettyDate(trip.date);
    if ($('#seat-bus-name')) $('#seat-bus-name').textContent = bus.operator;
    if ($('#seat-bus-meta')) $('#seat-bus-meta').textContent = `${bus.type} · ${bus.duration} · ${bus.rating} ★`;
    if ($('#seat-price')) $('#seat-price').textContent = money(bus.fare).replace('₹', '');
    if ($('#summary-bus-name')) $('#summary-bus-name').textContent = bus.operator;
    if ($('#summary-bus-route')) $('#summary-bus-route').textContent = tripText(trip);
    if ($('#summary-bus-date')) $('#summary-bus-date').textContent = prettyDate(trip.date);

    const maxSeats = 6;
    let deck = 'lower';
    let chosen = new Set(data.seats || []);

    const occupiedLower = new Set([2, 5, 8, 13, 14, 18, 21, 26, 29, 32]);
    const occupiedUpper = new Set([34, 37, 42, 47]);

    function render() {
      const total = deck === 'lower' ? 32 : 20;
      const start = deck === 'lower' ? 1 : 33;
      const occupied = deck === 'lower' ? occupiedLower : occupiedUpper;
      grid.innerHTML = '';

      for (let i = 0; i < total; i += 4) {
        for (let j = 0; j < 4; j++) {
          const n = start + i + j;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'seat';
          btn.textContent = n;
          btn.setAttribute('aria-label', `Seat ${n}`);
          btn.dataset.seat = n;

          if (occupied.has(n)) {
            btn.classList.add('occupied');
            btn.disabled = true;
            btn.title = 'Already booked';
          }
          if (chosen.has(n)) {
            btn.classList.add('selected');
            btn.setAttribute('aria-pressed', 'true');
          }

          btn.addEventListener('click', () => {
            if (chosen.has(n)) {
              chosen.delete(n);
            } else {
              if (chosen.size >= maxSeats) {
                flash(`You can book up to ${maxSeats} seats per booking.`, 'error');
                return;
              }
              chosen.add(n);
            }
            data.seats = [...chosen].sort((a, b) => a - b);
            save(data);
            render();
            updateSummary();
          });

          grid.appendChild(btn);
          if (j === 1) {
            const aisle = document.createElement('span');
            aisle.className = 'aisle-gap';
            aisle.setAttribute('aria-hidden', 'true');
            grid.appendChild(aisle);
          }
        }
      }
      updateSummary();
    }

    function updateSummary() {
      const seats = [...chosen].sort((a, b) => a - b);
      const baseFare = bus.fare * seats.length;
      const fee = seats.length ? 36 : 0;
      const total = baseFare + fee;

      if ($('#selected-seat-list')) $('#selected-seat-list').textContent = seats.length ? seats.join(', ') : 'None selected';
      if ($('#selected-seat-count')) $('#selected-seat-count').textContent = String(seats.length);
      if ($('#seat-base-fare')) $('#seat-base-fare').textContent = money(baseFare);
      if ($('#seat-fee')) $('#seat-fee').textContent = money(fee);
      if ($('#seat-total')) $('#seat-total').textContent = money(total);
      if ($('#continue-seats')) $('#continue-seats').disabled = seats.length === 0;
    }

    $$('.deck-tab').forEach(btn => btn.addEventListener('click', () => {
      deck = btn.dataset.deck;
      $$('.deck-tab').forEach(b => b.classList.toggle('active', b === btn));
      render();
    }));

    $('#continue-seats')?.addEventListener('click', () => {
      if (!chosen.size) {
        flash('Select at least one seat to continue.', 'error');
        return;
      }
      data.seats = [...chosen].sort((a, b) => a - b);
      data.passengers = data.seats.map((seat, i) => data.passengers?.[i] || { seat, name: '', age: '', gender: 'Prefer not to say' });
      save(data);
      location.href = 'checkout.html';
    });

    $('#back-to-buses')?.addEventListener('click', () => { location.href = 'buses.html'; });
    render();
  }

  /* ==========================================================================
     Checkout: Passenger Details, Contact, Demo Payment & Promo Code
     ========================================================================== */

  function initCheckout() {
    const form = $('#checkout-form');
    if (!form) return;

    const data = read();
    const bus = selectedBus(data);
    const trip = data.trip || defaultTrip;
    let seats = [...(data.seats || [])];

    // If user arrived without selecting seats, default to [7, 14] for seamless testing
    if (!seats.length) {
      seats = [7, 14];
      data.seats = seats;
      save(data);
    }

    if ($('#checkout-route')) $('#checkout-route').textContent = tripText(trip);
    if ($('#checkout-bus-name')) $('#checkout-bus-name').textContent = bus.operator;
    if ($('#checkout-bus-route')) $('#checkout-bus-route').textContent = `${trip.from} → ${trip.to}`;
    if ($('#checkout-date')) $('#checkout-date').textContent = prettyDate(trip.date);
    if ($('#checkout-depart')) $('#checkout-depart').textContent = bus.depart;
    if ($('#checkout-seats')) $('#checkout-seats').textContent = seats.join(', ');

    const passengersWrap = $('#passenger-forms');
    if (passengersWrap) {
      passengersWrap.innerHTML = seats.map((seat, i) => {
        const p = data.passengers?.[i] || {};
        return `<div class="passenger-form">
          <div class="passenger-top">
            <span>Passenger ${i + 1}</span>
            <span class="step-pill">Seat ${seat}</span>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label for="passenger-name-${i}">Full name</label>
              <input id="passenger-name-${i}" name="passengerName" autocomplete="name" placeholder="Enter passenger name" value="${escapeAttr(p.name || '')}" required minlength="2">
            </div>
            <div class="form-field">
              <label for="passenger-age-${i}">Age</label>
              <input id="passenger-age-${i}" name="passengerAge" type="number" min="1" max="115" placeholder="Age" value="${escapeAttr(p.age || '')}" required>
            </div>
            <div class="form-field">
              <label for="passenger-gender-${i}">Gender</label>
              <select id="passenger-gender-${i}" name="passengerGender">
                <option ${p.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option ${p.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option ${p.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>`;
      }).join('');
    }

    if ($('#contact-phone')) $('#contact-phone').value = data.contact?.phone || '';
    if ($('#contact-email')) $('#contact-email').value = data.contact?.email || '';

    const base = bus.fare * seats.length;
    let offerDiscount = 0;

    const fmtSummary = () => {
      const fee = seats.length ? 36 : 0;
      const total = Math.max(0, base + fee - offerDiscount);
      if ($('#checkout-base')) $('#checkout-base').textContent = money(base);
      if ($('#checkout-discount')) $('#checkout-discount').textContent = offerDiscount ? `− ${money(offerDiscount)}` : money(0);
      if ($('#checkout-fee')) $('#checkout-fee').textContent = money(fee);
      if ($('#checkout-total')) $('#checkout-total').textContent = money(total);
    };
    fmtSummary();

    $('#apply-offer')?.addEventListener('click', () => {
      const code = ($('#offer-code')?.value || '').trim().toUpperCase();
      const msg = $('#offer-message');
      if (!msg) return;

      if (code === 'ROUTE10') {
        offerDiscount = Math.min(300, Math.round(base * 0.1));
        msg.textContent = `Nice! ${money(offerDiscount)} discount applied.`;
        msg.style.color = '#148447';
        data.offer = code;
      } else if (code === 'FIRSTBUS') {
        offerDiscount = 150;
        msg.textContent = `${money(offerDiscount)} discount applied.`;
        msg.style.color = '#148447';
        data.offer = code;
      } else {
        offerDiscount = 0;
        msg.textContent = 'Invalid promo code. Try ROUTE10 or FIRSTBUS.';
        msg.style.color = '#b42318';
        data.offer = '';
      }
      save(data);
      fmtSummary();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const phone = ($('#contact-phone')?.value || '').trim();
      const email = ($('#contact-email')?.value || '').trim();

      if (phone.replace(/\D/g, '').length < 10) {
        flash('Enter a valid 10-digit mobile number.', 'error');
        $('#contact-phone')?.focus();
        return;
      }

      const passengerForms = $$('.passenger-form', passengersWrap);
      const passengers = passengerForms.map((el, i) => ({
        seat: seats[i],
        name: $('[name="passengerName"]', el)?.value.trim() || `Passenger ${i + 1}`,
        age: $('[name="passengerAge"]', el)?.value || '22',
        gender: $('[name="passengerGender"]', el)?.value || 'Prefer not to say'
      }));

      const payment = $('input[name="payment"]:checked')?.value || 'upi';
      const fee = seats.length ? 36 : 0;
      const amount = Math.max(0, base + fee - offerDiscount);

      const bookingId = generateBookingId();
      const now = new Date();
      const bookedAtFormatted = formatDateTime(now.toISOString());

      const booking = {
        id: bookingId,
        createdAt: now.toISOString(),
        bookedAtFormatted: bookedAtFormatted,
        amount: amount,
        base: base,
        fee: fee,
        discount: offerDiscount,
        offerCode: data.offer || '',
        farePerSeat: bus.fare,
        seatCount: seats.length,
        seats: [...seats],
        passengers: [...passengers],
        contact: { phone, email },
        bus: { ...bus },
        trip: { ...trip },
        payment: payment,
        paymentLabel: paymentLabels[payment] || 'UPI (Demo Simulation)',
        status: 'Confirmed',
        demo: true,
        disclaimer: 'DEMO RECEIPT — No real ticket issued. No payment processed.'
      };

      data.passengers = passengers;
      data.contact = { phone, email };
      data.payment = payment;
      data.booking = booking;
      data.latestBooking = booking; // Persisted so "My Tickets" retains the receipt on reload
      const hist = Array.isArray(data.savedBookings) ? data.savedBookings : [];
      data.savedBookings = [booking, ...hist.filter(b => b.id !== booking.id)].slice(0, 10);

      save(data);
      location.href = 'ticket.html';
    });
  }

  /* ==========================================================================
     Procedural SVG QR Code Generation (Self-Contained, No External Script)
     ========================================================================== */

  function qrSvg(seed, trip, seats) {
    const size = 29;
    const matrix = Array.from({ length: size }, () => Array(size).fill(false));

    function placeFinder(startX, startY) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const x = startX + c;
          const y = startY + r;
          if (x >= 0 && x < size && y >= 0 && y < size) {
            if (r === -1 || r === 7 || c === -1 || c === 7) {
              matrix[y][x] = false;
            } else if (r === 0 || r === 6 || c === 0 || c === 6) {
              matrix[y][x] = true;
            } else if (r === 1 || r === 5 || c === 1 || c === 5) {
              matrix[y][x] = false;
            } else {
              matrix[y][x] = true;
            }
          }
        }
      }
    }

    placeFinder(0, 0);
    placeFinder(size - 7, 0);
    placeFinder(0, size - 7);

    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    const ax = 20, ay = 20;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2) matrix[ay + r][ax + c] = true;
        else if (r === 0 && c === 0) matrix[ay + r][ax + c] = true;
        else matrix[ay + r][ax + c] = false;
      }
    }

    const seedStr = String(seed || 'ROUTE-DEMO') + (trip ? `${trip.from}-${trip.to}` : '') + (seats ? seats.join('') : '');
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619) >>> 0;
    }
    const rand = () => {
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      return (h >>> 0) / 4294967296;
    };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const inTL = x <= 7 && y <= 7;
        const inTR = x >= size - 8 && y <= 7;
        const inBL = x <= 7 && y >= size - 8;
        const inAlign = x >= 18 && x <= 22 && y >= 18 && y <= 22;
        const isTiming = (y === 6 && x >= 8 && x < size - 8) || (x === 6 && y >= 8 && y < size - 8);

        if (!inTL && !inTR && !inBL && !inAlign && !isTiming) {
          matrix[y][x] = rand() > 0.48;
        }
      }
    }

    let rects = '';
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (matrix[y][x]) {
          rects += `<rect x="${x + 2}" y="${y + 2}" width="1" height="1" fill="#171717"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size + 4} ${size + 4}" shape-rendering="crispEdges" role="img" aria-label="Demo QR code for ${escapeAttr(seed)}"><rect width="${size + 4}" height="${size + 4}" fill="#ffffff"/><rect x="1" y="1" width="${size + 2}" height="${size + 2}" fill="none" stroke="#e0dcd2" stroke-width="0.5"/>${rects}</svg>`;
  }

  /* ==========================================================================
     Standalone Offline Downloadable Receipt HTML Generator
     ========================================================================== */

  function generateStandaloneReceiptHTML(booking) {
    const trip = booking.trip || defaultTrip;
    const bus = booking.bus || buses[0];
    const seats = booking.seats?.length ? booking.seats : [7, 14];
    const passengers = booking.passengers?.length ? booking.passengers : [{ seat: seats[0], name: 'Passenger', age: '20', gender: 'Prefer not to say' }];
    const qrCode = qrSvg(booking.id, trip, seats);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>ROUTE Demo Bus Ticket — ${escapeAttr(booking.id)}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap');
    :root {
      --paper: #f4f0e6;
      --paper-light: #fbf9f3;
      --ink: #171717;
      --muted: #76756f;
      --line: #d9d5ca;
      --blue: #194bff;
      --white: #fffefa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: var(--paper);
      color: var(--ink);
      font-family: 'DM Sans', -apple-system, sans-serif;
      font-size: 13px;
      line-height: 1.45;
    }
    .print-bar {
      max-width: 860px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--blue);
      color: #fff;
      border: 1px solid var(--blue);
      border-radius: 6px;
      padding: 10px 16px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      text-decoration: none;
    }
    .ticket {
      max-width: 860px;
      margin: 0 auto;
      background: var(--white);
      border: 1px solid #d4cfc2;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(26,25,22,.08);
      position: relative;
    }
    .ticket:before {
      content: "";
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 6px;
      background: var(--blue);
    }
    .ticket-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 26px;
      background: #fbf9f3;
      border-bottom: 1px solid var(--line);
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -1px;
    }
    .brand-title span { color: var(--blue); }
    .ticket-type {
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-top: 2px;
    }
    .booking-id-box {
      text-align: right;
    }
    .booking-id-box span {
      display: block;
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: .12em;
      color: var(--muted);
      text-transform: uppercase;
    }
    .booking-id-box strong {
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      color: var(--ink);
    }
    .disclaimer-strip {
      background: #fff2df;
      color: #9b4d00;
      border-bottom: 1px dashed #f6cf96;
      padding: 8px 26px;
      font-family: 'DM Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
    }
    .route-strip {
      display: grid;
      grid-template-columns: 1fr 1.2fr 1fr;
      align-items: center;
      gap: 16px;
      padding: 22px 26px;
      border-bottom: 1px solid var(--line);
    }
    .city strong {
      font-family: 'Oswald', sans-serif;
      font-size: 27px;
      text-transform: uppercase;
      display: block;
      line-height: 1.1;
    }
    .city span {
      font-size: 11px;
      color: var(--muted);
      display: block;
      margin-top: 3px;
    }
    .city small {
      display: inline-block;
      margin-top: 6px;
      background: #f2eee5;
      padding: 3px 7px;
      border-radius: 4px;
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      font-weight: 700;
    }
    .dropping { text-align: right; }
    .connector { text-align: center; }
    .connector .duration {
      display: inline-block;
      background: #f0eee6;
      padding: 3px 9px;
      border-radius: 20px;
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .connector .line {
      color: var(--blue);
      font-size: 12px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      padding: 18px 26px;
      border-bottom: 1px dashed var(--line);
      background: #fdfcf9;
    }
    .meta-grid div span {
      display: block;
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      letter-spacing: .1em;
      color: var(--muted);
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .meta-grid div strong {
      font-size: 12px;
      color: var(--ink);
    }
    .details-split {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 20px;
      padding: 22px 26px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      border: 1px solid var(--line);
      border-radius: 6px;
    }
    th {
      background: #f6f3eb;
      padding: 7px 9px;
      text-align: left;
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    td {
      padding: 8px 9px;
      border-top: 1px solid #f0ede5;
    }
    .fare-box {
      background: #fbf9f4;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
    }
    .fare-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 11px;
    }
    .fare-row.total {
      border-top: 1px dashed var(--line);
      padding-top: 8px;
      margin-top: 8px;
      font-weight: 800;
      font-size: 13px;
    }
    .fare-row.total strong {
      font-family: 'Oswald', sans-serif;
      font-size: 20px;
      color: var(--blue);
    }
    .qr-box {
      display: flex;
      gap: 12px;
      align-items: center;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: #fff;
    }
    .qr-svg {
      width: 86px;
      height: 86px;
      flex-shrink: 0;
    }
    .footer-strip {
      background: #f3efe4;
      border-top: 1px solid var(--line);
      padding: 12px 26px;
      font-size: 9px;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .print-bar { display: none !important; }
      .ticket { box-shadow: none; border: 1px solid #000; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span style="font-family:'DM Mono',monospace;font-size:11px;">ROUTE DEMO BUS TICKET · ${escapeAttr(booking.id)}</span>
    <button class="btn" onclick="window.print()">⎙ Print / Save as PDF</button>
  </div>
  <div class="ticket">
    <div class="ticket-head">
      <div>
        <div class="brand-title">ROUTE<span>.</span></div>
        <div class="ticket-type">DEMO BUS E-TICKET & BOOKING RECEIPT</div>
      </div>
      <div class="booking-id-box">
        <span>BOOKING ID</span>
        <strong>${escapeAttr(booking.id)}</strong>
      </div>
    </div>
    <div class="disclaimer-strip">
      ⚠ DEMO RECEIPT — No real ticket issued. No payment processed. Academic project demo.
    </div>
    <div class="route-strip">
      <div class="city">
        <span style="font-family:'DM Mono',monospace;font-size:8px;color:var(--blue);font-weight:700;">BOARDING POINT</span>
        <strong>${escapeAttr(trip.from)}</strong>
        <span>${escapeAttr(bus.start || 'Boarding Terminal')}</span>
        <small>◷ ${escapeAttr(bus.depart)} · ${prettyDate(trip.date)}</small>
      </div>
      <div class="connector">
        <span class="duration">${escapeAttr(bus.duration)}</span>
        <div class="line">─── ⌖ ───────►</div>
        <div style="font-size:10px;color:var(--muted);margin-top:4px;">${escapeAttr(bus.operator)} · ${escapeAttr(bus.type)}</div>
      </div>
      <div class="city dropping">
        <span style="font-family:'DM Mono',monospace;font-size:8px;color:var(--blue);font-weight:700;">DROPPING POINT</span>
        <strong>${escapeAttr(trip.to)}</strong>
        <span>${escapeAttr(bus.end || 'Dropping Terminal')}</span>
        <small>◷ ${escapeAttr(bus.arrive)} · ${prettyDate(trip.date)}</small>
      </div>
    </div>
    <div class="meta-grid">
      <div><span>Operator</span><strong>${escapeAttr(bus.operator)}</strong></div>
      <div><span>Bus Type</span><strong>${escapeAttr(bus.type)}</strong></div>
      <div><span>Seats</span><strong style="color:var(--blue);">${seats.join(', ')}</strong></div>
      <div><span>Booked At</span><strong>${escapeAttr(booking.bookedAtFormatted || formatDateTime(booking.createdAt))}</strong></div>
    </div>
    <div class="details-split">
      <div>
        <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;font-weight:700;">Passenger details</div>
        <table>
          <thead>
            <tr><th>#</th><th>Passenger Name</th><th>Seat</th><th>Age</th><th>Gender</th></tr>
          </thead>
          <tbody>
            ${passengers.map((p, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${escapeAttr(p.name || 'Passenger ' + (idx + 1))}</strong></td>
                <td>Seat ${escapeAttr(p.seat || seats[idx] || (idx + 1))}</td>
                <td>${escapeAttr(p.age || '—')}</td>
                <td>${escapeAttr(p.gender || '—')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top:12px;font-size:10px;color:var(--muted);">
          Contact Phone: <strong>${escapeAttr(booking.contact?.phone || '—')}</strong> · Email: <strong>${escapeAttr(booking.contact?.email || '—')}</strong>
        </div>
      </div>
      <div>
        <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:8px;text-transform:uppercase;font-weight:700;">Fare Breakdown</div>
        <div class="fare-box">
          <div class="fare-row"><span>Fare per seat</span><strong>${money(booking.farePerSeat || bus.fare)}</strong></div>
          <div class="fare-row"><span>Number of seats</span><strong>${seats.length}</strong></div>
          <div class="fare-row"><span>Base fare subtotal</span><strong>${money(booking.base || (bus.fare * seats.length))}</strong></div>
          <div class="fare-row"><span>Convenience fee</span><strong>${money(booking.fee ?? 36)}</strong></div>
          ${booking.discount ? `<div class="fare-row" style="color:#127c3f"><span>Promo discount</span><strong>− ${money(booking.discount)}</strong></div>` : ''}
          <div class="fare-row total"><span>Total Amount</span><strong>${money(booking.amount)}</strong></div>
          <div style="margin-top:8px;font-size:10px;color:var(--muted);display:flex;justify-content:space-between;">
            <span>Payment method:</span><strong>${escapeAttr(booking.paymentLabel || 'UPI (Demo)')}</strong>
          </div>
        </div>
        <div class="qr-box">
          <div class="qr-svg">${qrCode}</div>
          <div style="font-size:10px;">
            <div style="font-family:'DM Mono',monospace;font-weight:700;">${escapeAttr(booking.id)}</div>
            <div style="color:var(--muted);">${escapeAttr(trip.from)} → ${escapeAttr(trip.to)}</div>
            <div style="font-family:'DM Mono',monospace;font-size:8px;color:var(--muted);margin-top:4px;">DEMO QR · NON-TRANSACTIONAL</div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-strip">
      <span>DEMO RECEIPT — College Demonstration Project. No real transaction has occurred.</span>
      <span>ROUTE. Same roads, new stories. 2026</span>
    </div>
  </div>
</body>
</html>`;
  }

  function downloadReceipt(booking) {
    try {
      const htmlContent = generateStandaloneReceiptHTML(booking);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ROUTE-Receipt-${booking.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      flash(`Demo receipt downloaded: ROUTE-Receipt-${booking.id}.html`);
    } catch (e) {
      window.print();
    }
  }

  function createDemoSampleBooking() {
    const bus = buses[0];
    const trip = { ...defaultTrip };
    const seats = [7, 14];
    const bookingId = generateBookingId();
    const now = new Date();
    const base = bus.fare * seats.length;
    const fee = 36;
    const discount = 0;
    const amount = base + fee - discount;

    const sample = {
      id: bookingId,
      createdAt: now.toISOString(),
      bookedAtFormatted: formatDateTime(now.toISOString()),
      amount: amount,
      base: base,
      fee: fee,
      discount: discount,
      offerCode: '',
      farePerSeat: bus.fare,
      seatCount: seats.length,
      seats: seats,
      passengers: [
        { seat: 7, name: 'Jenil Banavani', age: '20', gender: 'Male' },
        { seat: 14, name: 'Harshad Solanki', age: '20', gender: 'Male' }
      ],
      contact: { phone: '+91 98765 43210', email: 'jenil@example.com' },
      bus: { ...bus },
      trip: { ...trip },
      payment: 'upi',
      paymentLabel: 'UPI (Demo Simulation)',
      status: 'Confirmed',
      demo: true,
      disclaimer: 'DEMO RECEIPT — No real ticket issued. No payment processed.'
    };

    const data = read();
    data.booking = sample;
    data.latestBooking = sample;
    data.savedBookings = [sample, ...(data.savedBookings || []).filter(b => b.id !== sample.id)];
    save(data);
    return sample;
  }

  /* ==========================================================================
     Ticket / My Tickets Confirmation Page
     ========================================================================== */

  function initTicket() {
    const root = $('#ticket-root');
    if (!root) return;

    const data = read();
    // Prioritize active booking, then latest persistent booking, then past history
    let booking = data.booking || data.latestBooking || (data.savedBookings && data.savedBookings[0]);

    const headerTitle = $('#ticket-header-title');
    const headerSub = $('#ticket-header-sub');
    const headerIcon = $('#ticket-status-icon');
    const pageToplineLabel = $('#page-section-label');
    const actionsWrap = $('#ticket-actions');

    // Case 1: No saved demo booking exists yet in this browser
    if (!booking) {
      if (headerTitle) headerTitle.innerHTML = 'My Tickets <span>— Demo Archive</span>';
      if (headerSub) headerSub.textContent = 'No demo tickets booked yet. Book your bus trip below or test with a sample ticket.';
      if (headerIcon) headerIcon.textContent = '🎫';
      if (pageToplineLabel) pageToplineLabel.textContent = 'My Tickets';

      root.innerHTML = `<div class="empty-ticket-card">
        <div class="empty-ticket-icon">▦</div>
        <h2>No saved tickets yet</h2>
        <p>You haven’t completed any demo bus bookings in this browser yet. Search routes and select seats to generate your official demo ticket, or load a realistic sample receipt instantly.</p>
        <div class="empty-actions">
          <a href="home.html" class="btn">Find a bus now <span>→</span></a>
          <button class="btn secondary" id="load-sample-btn" type="button">Preview sample ticket <span>↗</span></button>
        </div>
      </div>`;

      if (actionsWrap) actionsWrap.style.display = 'none';

      $('#load-sample-btn')?.addEventListener('click', () => {
        createDemoSampleBooking();
        initTicket();
        flash('Sample demo receipt generated successfully!');
      });
      return;
    }

    // Case 2: Booking exists (either freshly completed OR reloading/revisiting My Tickets)
    if (actionsWrap) actionsWrap.style.display = 'flex';

    const isJustBooked = Boolean(data.booking);
    if (headerTitle) {
      headerTitle.innerHTML = isJustBooked
        ? 'Booking <span>Confirmed — Demo</span>'
        : 'Your Demo <span>Bus Ticket & Receipt</span>';
    }
    if (headerSub) {
      headerSub.textContent = isJustBooked
        ? 'Your demo booking receipt is ready. Keep this ticket handy before boarding.'
        : 'Saved demo booking receipt retrieved from your local browser storage.';
    }
    if (headerIcon) headerIcon.textContent = '✓';
    if (pageToplineLabel) pageToplineLabel.textContent = isJustBooked ? 'All aboard' : 'My Tickets';

    const trip = booking.trip || data.trip || defaultTrip;
    const bus = booking.bus || selectedBus(data);
    const seats = booking.seats?.length ? booking.seats : (data.seats?.length ? data.seats : [7, 14]);
    const passengers = booking.passengers?.length ? booking.passengers : (data.passengers?.length ? data.passengers : [{ seat: seats[0], name: 'Passenger', age: '20', gender: 'Prefer not to say' }]);

    const farePerSeat = booking.farePerSeat || bus.fare;
    const baseFare = booking.base || (farePerSeat * seats.length);
    const fee = booking.fee !== undefined ? booking.fee : (seats.length ? 36 : 0);
    const discount = booking.discount || 0;
    const totalAmount = booking.amount || Math.max(0, baseFare + fee - discount);
    const paymentLabel = booking.paymentLabel || paymentLabels[booking.payment || data.payment] || 'UPI (Demo Simulation)';
    const bookingTimeFormatted = booking.bookedAtFormatted || formatDateTime(booking.createdAt);

    root.innerHTML = `
      <div class="ticket-head">
        <div class="ticket-brand">
          <img src="assets/route-mark.svg" alt="ROUTE Logo" width="34" height="34">
          <div class="ticket-brand-text">
            <span class="brand-word">ROUTE<span>.</span></span>
            <span class="ticket-subtitle">DEMO BUS E-TICKET & BOOKING RECEIPT</span>
          </div>
        </div>
        <div class="ticket-badges">
          <span class="ticket-status-badge">● BOOKING CONFIRMED — DEMO</span>
          <div class="ticket-id-wrap">
            <span class="ticket-id-label">BOOKING ID</span>
            <div class="ticket-id-val">
              <strong id="ticket-booking-id">${escapeAttr(booking.id)}</strong>
              <button class="copy-id-btn" id="copy-booking-id" title="Copy Booking ID" type="button">⧉ Copy</button>
            </div>
          </div>
        </div>
      </div>

      <div class="ticket-notice-strip">
        <span class="notice-icon">⚠</span>
        <span><strong>DEMO RECEIPT — No real ticket issued. No payment processed.</strong> Generated for academic demonstration.</span>
      </div>

      <div class="ticket-route-strip">
        <div class="route-city-block boarding">
          <span class="route-badge">BOARDING POINT</span>
          <strong class="route-city-name">${escapeAttr(trip.from)}</strong>
          <span class="route-station-name">${escapeAttr(bus.start || 'Central Boarding Point')}</span>
          <div class="route-time-pill">
            <span class="time-clock">◷ ${escapeAttr(bus.depart)}</span>
            <span class="time-date">${prettyDate(trip.date)}</span>
          </div>
        </div>

        <div class="route-connector-block">
          <span class="duration-badge">${escapeAttr(bus.duration)}</span>
          <div class="route-line-graphic">
            <span class="dot-start">●</span>
            <span class="dash-line"></span>
            <span class="arrow-mid">➤</span>
            <span class="dash-line"></span>
            <span class="dot-end">●</span>
          </div>
          <span class="route-bus-info">${escapeAttr(bus.operator)} · ${escapeAttr(bus.type)}</span>
        </div>

        <div class="route-city-block dropping">
          <span class="route-badge">DROPPING POINT</span>
          <strong class="route-city-name">${escapeAttr(trip.to)}</strong>
          <span class="route-station-name">${escapeAttr(bus.end || 'Central Terminus')}</span>
          <div class="route-time-pill">
            <span class="time-clock">◷ ${escapeAttr(bus.arrive)}</span>
            <span class="time-date">${prettyDate(trip.date)}</span>
          </div>
        </div>
      </div>

      <div class="ticket-body">
        <div class="ticket-meta-grid">
          <div class="meta-item">
            <span>Bus Operator</span>
            <strong>${escapeAttr(bus.operator)}</strong>
            <small>${escapeAttr(bus.rating)} ★ (${escapeAttr(bus.reviews || '1.8K')} reviews)</small>
          </div>
          <div class="meta-item">
            <span>Bus Type</span>
            <strong>${escapeAttr(bus.type)}</strong>
            <small>${escapeAttr((bus.amenities || ['AC', 'WiFi', 'Charging']).slice(0, 3).join(' · '))}</small>
          </div>
          <div class="meta-item">
            <span>Selected Seats</span>
            <strong class="seats-highlight">${seats.join(', ')}</strong>
            <small>${seats.length} seat${seats.length > 1 ? 's' : ''} reserved</small>
          </div>
          <div class="meta-item">
            <span>Booking Date & Time</span>
            <strong>${escapeAttr(bookingTimeFormatted)}</strong>
            <small>Local Browser Storage</small>
          </div>
        </div>

        <div class="ticket-perforation">
          <span class="notch notch-left"></span>
          <span class="perf-line"></span>
          <span class="perf-label">BOARDING & PASSENGER INFORMATION</span>
          <span class="perf-line"></span>
          <span class="notch notch-right"></span>
        </div>

        <div class="ticket-details-split">
          <div class="ticket-left-col">
            <div class="section-micro-title">PASSENGER DETAILS (${passengers.length})</div>
            <div class="passenger-table-wrap">
              <table class="passenger-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Passenger Name</th>
                    <th>Seat</th>
                    <th>Age</th>
                    <th>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  ${passengers.map((p, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td><strong>${escapeAttr(p.name || 'Passenger ' + (idx + 1))}</strong></td>
                      <td><span class="seat-pill">Seat ${escapeAttr(p.seat || seats[idx] || (idx + 1))}</span></td>
                      <td>${escapeAttr(p.age || '—')}</td>
                      <td>${escapeAttr(p.gender || 'Prefer not to say')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="section-micro-title" style="margin-top:16px;">CONTACT DETAILS</div>
            <div class="contact-info-strip">
              <div class="contact-item">
                <span>Mobile Phone</span>
                <strong>${escapeAttr(booking.contact?.phone || data.contact?.phone || 'Not provided')}</strong>
              </div>
              <div class="contact-item">
                <span>Email Address</span>
                <strong>${escapeAttr(booking.contact?.email || data.contact?.email || 'demo@route-bus.local')}</strong>
              </div>
              <div class="contact-item">
                <span>Reporting Notice</span>
                <strong>15 mins before depart</strong>
              </div>
            </div>
          </div>

          <div class="ticket-right-col">
            <div class="section-micro-title">FARE SUMMARY & PAYMENT</div>
            <div class="receipt-fare-table">
              <div class="fare-row">
                <span>Fare per seat</span>
                <strong>${money(farePerSeat)}</strong>
              </div>
              <div class="fare-row">
                <span>Number of seats</span>
                <strong>${seats.length}</strong>
              </div>
              <div class="fare-row">
                <span>Base fare subtotal</span>
                <strong>${money(baseFare)}</strong>
              </div>
              <div class="fare-row">
                <span>Convenience fee</span>
                <strong>${money(fee)}</strong>
              </div>
              ${discount > 0 ? `
              <div class="fare-row discount-row">
                <span>Promo discount (${escapeAttr(booking.offerCode || 'APPLIED')})</span>
                <strong class="green-text">− ${money(discount)}</strong>
              </div>` : ''}
              <div class="fare-row total-row">
                <span>Total Amount</span>
                <strong class="total-amount">${money(totalAmount)}</strong>
              </div>
              <div class="payment-method-row">
                <span class="method-label">Payment method</span>
                <span class="method-badge">✓ ${escapeAttr(paymentLabel)}</span>
              </div>
              <div class="payment-status-row">
                <span>Payment status</span>
                <strong class="status-confirmed">Paid (Demo Simulation)</strong>
              </div>
            </div>

            <div class="ticket-qr-block">
              <div class="qr-container">
                ${qrSvg(booking.id, trip, seats)}
              </div>
              <div class="qr-info">
                <div class="qr-id-text">${escapeAttr(booking.id)}</div>
                <div class="qr-route-text">${escapeAttr(trip.from)} → ${escapeAttr(trip.to)} · Seats ${seats.join(', ')}</div>
                <div class="qr-subtext">DEMO QR · NON-TRANSACTIONAL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ticket-footer">
        <div class="footer-col">
          <span>DEMO RECEIPT NOTICE</span>
          <p>This document is an academic demonstration receipt for college evaluation. No real bus ticket has been issued, and no real payment was processed.</p>
        </div>
        <div class="footer-col align-right">
          <span>SYSTEM VERIFICATION</span>
          <p>ROUTE Online Bus Ticket Booking System · Stored in Local Browser Storage · College Demo 2026</p>
        </div>
      </div>
    `;

    // Event listeners
    $('#copy-booking-id')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(booking.id);
        flash(`Booking ID ${booking.id} copied to clipboard!`);
      } catch {
        flash(`Booking ID: ${booking.id}`);
      }
    });

    $('#download-ticket')?.addEventListener('click', () => {
      downloadReceipt(booking);
    });

    $('#print-ticket')?.addEventListener('click', () => {
      window.print();
    });

    $('#book-another-ticket')?.addEventListener('click', () => {
      const fresh = read();
      fresh.seats = [];
      fresh.passengers = [];
      fresh.offer = '';
      fresh.booking = null; // Clears active draft so home begins clean
      // Note: fresh.latestBooking and fresh.savedBookings remain untouched in localStorage!
      save(fresh);
      location.href = 'home.html';
    });

    $('#share-ticket')?.addEventListener('click', async () => {
      const text = `ROUTE DEMO BUS TICKET\nBooking ID: ${booking.id}\nJourney: ${tripText(trip)}\nDate: ${prettyDate(trip.date)} · Depart: ${bus.depart}\nSeats: ${seats.join(', ')}\nTotal: ${money(totalAmount)}\nStatus: Demo Confirmed (Academic Project)`;
      try {
        if (navigator.share) {
          await navigator.share({ title: 'ROUTE Demo Bus Ticket', text });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          flash('Ticket summary copied to clipboard.');
        } else {
          flash(text);
        }
      } catch (e) {
        if (e.name !== 'AbortError') flash('Could not share ticket.', 'error');
      }
    });
  }

  /* ==========================================================================
     Application Bootstrap
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHome();
    initBuses();
    initSeats();
    initCheckout();
    initTicket();
  });
})();
