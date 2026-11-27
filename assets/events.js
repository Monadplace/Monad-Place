(() => {
  const events = window.monadEvents;
  const format = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/Phoenix"
  });

  function eligible(now = Date.now()) {
    return events.map(event => {
      if (!event.dates) return event;
      const upcomingDates = event.dates.filter(date => Date.parse(date.end) > now);
      return upcomingDates.length ? { ...event, ...upcomingDates[0], upcomingDates } : null;
    }).filter(event => {
      if (!event) return false;
      if (event.visibility !== "public") return false;
      if (!event.start && !event.end) return true;
      const start = Date.parse(event.start);
      const end = Date.parse(event.end);
      return Number.isFinite(start) && end > start && end > now;
    }).sort((a, b) => (Date.parse(a.start) || Infinity) - (Date.parse(b.start) || Infinity));
  }

  const dayFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "America/Phoenix" });
  const timeFormat = new Intl.DateTimeFormat("en-US", { timeStyle: "short", timeZone: "America/Phoenix" });

  function timing(event) {
    if (event.dateLabel) return event.dateLabel;
    if (event.allDay) return dayFormat.format(new Date(event.start)) + " · Time to be confirmed";
    if (event.end) return dayFormat.format(new Date(event.start)) + " · " + timeFormat.formatRange(new Date(event.start), new Date(event.end)) + " (Arizona time)";
    return event.start ? format.format(new Date(event.start)) + " (Arizona time)" : "Date to be announced";
  }

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  const list = document.querySelector("[data-event-list]");
  if (list) {
    const cards = events.filter(event => event.visibility === "public" && !event.clientHosted);
    const dateLabels = new Map();
    const registrationLinks = new Map();

    list.replaceChildren();
    if (!cards.length) list.append(element("p", "Check back for the next public event."));
    for (const event of cards) {
      const row = element("details", null, "event-row");
      row.id = event.id;
      const summary = element("summary");
      const dateLabel = element("span", null, "event-next-date");
      summary.append(element("strong", event.title), dateLabel);
      const copy = element("div", null, "event-row-content");
      copy.append(element("p", event.category, "community-kicker"), element("p", event.description));
      if (event.poster) {
        const flyer = element("img", null, "event-flyer");
        flyer.src = "../assets/" + event.poster;
        flyer.alt = event.title + " flyer";
        flyer.width = 800;
        flyer.height = 1000;
        flyer.loading = "lazy";
        copy.prepend(flyer);
      }
      if (event.price) copy.append(element("p", event.price));
      if (/^https:\/\//i.test(event.registrationUrl || "")) {
        const registration = element("a", "Registration details");
        registration.href = event.registrationUrl;
        registrationLinks.set(event.id, registration);
        copy.append(registration);
      }
      row.append(summary, copy);
      list.append(row);
      dateLabels.set(event.id, dateLabel);
    }

    const clientListings = document.querySelectorAll('[data-event-end]');
    function updateDates() {
      for (const listing of clientListings) listing.hidden = Date.parse(listing.dataset.eventEnd) <= Date.now();
      const upcoming = new Map(eligible().map(event => [event.id, event]));
      for (const [id, label] of dateLabels) {
        const next = upcoming.get(id);
        const text = next?.start ? "Next: " + timing(next) : "Next date to be announced";
        if (label.textContent !== text) label.textContent = text;
        const registration = registrationLinks.get(id);
        if (registration) registration.hidden = !next?.start;
      }
    }

    function openLinkedEvent() {
      const row = document.getElementById(location.hash.slice(1));
      if (row?.matches("details.event-row")) {
        row.open = true;
        row.scrollIntoView();
      }
    }

    updateDates();
    openLinkedEvent();
    setInterval(updateDates, 15000);
    document.addEventListener("visibilitychange", updateDates);
    window.addEventListener("hashchange", openLinkedEvent);
  }

  const title = document.querySelector("[data-banner-title]");
  if (!title) return;
  const details = document.querySelector("[data-banner-details]");
  const link = document.querySelector("[data-banner-link]");
  const controls = document.querySelector("[data-rotation]");
  const pause = document.querySelector("[data-pause]");
  const status = document.querySelector("[data-rotation-status]");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = motion.matches;
  let selected;
  let nextRotation = Date.now() + 7000;
  let pointerInside = false;
  const banner = title.closest(".community-banner");

  function draw(direction = 0, announce = false) {
    const featured = eligible().filter(event => event.featured);
    const key = event => event ? event.id + "|" + (event.start || "") : undefined;
    const current = featured.findIndex(event => key(event) === selected);
    const index = current < 0 ? 0 : (current + direction + featured.length) % featured.length;
    const event = featured[index];
    if (selected !== key(event)) {
      selected = key(event);
      if (event?.poster && /^[a-z0-9][a-z0-9._-]*$/i.test(event.poster)) {
        banner.style.setProperty("--event-art", 'url("assets/' + event.poster + '")');
        banner.style.setProperty("--event-art-position", event.bannerPosition || "65%");
      } else {
        banner.style.removeProperty("--event-art");
        banner.style.removeProperty("--event-art-position");
      }
      title.textContent = event?.title || "See what’s happening at Monad Place";
      details.textContent = event ? timing(event) + " · " + event.category : "Explore gatherings open to the public.";
      link.href = "events/" + (event ? "#" + event.id : "");
    }
    controls.hidden = featured.length < 2;
    pause.textContent = paused ? "Play" : "Pause";
    if (announce && event) status.textContent = event.title + ", event " + (index + 1) + " of " + featured.length;
  }

  function step(direction) {
    draw(direction, true);
    nextRotation = Date.now() + 7000;
  }

  document.querySelector("[data-prev]").addEventListener("click", () => step(-1));
  document.querySelector("[data-next]").addEventListener("click", () => step(1));
  pause.addEventListener("click", () => {
    paused = !paused;
    draw();
    nextRotation = Date.now() + 7000;
  });
  motion.addEventListener("change", () => { paused = motion.matches; draw(); });
  banner.addEventListener("mouseenter", () => { pointerInside = true; });
  banner.addEventListener("mouseleave", () => { pointerInside = false; });
  draw();
  setInterval(() => {
    draw();
    if (!paused && !pointerInside && !banner.contains(document.activeElement)
        && !document.hidden && Date.now() >= nextRotation) {
      draw(1);
      nextRotation = Date.now() + 7000;
    }
  }, 1000);
})();
