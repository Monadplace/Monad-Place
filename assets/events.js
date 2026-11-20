(() => {
  const events = window.monadEvents;
  const format = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/Phoenix"
  });

  function eligible(now = Date.now()) {
    return events.filter(event => {
      if (event.visibility !== "public") return false;
      if (!event.start && !event.end) return true;
      const start = Date.parse(event.start);
      const end = Date.parse(event.end);
      return Number.isFinite(start) && end > start && end > now;
    }).sort((a, b) => (Date.parse(a.start) || Infinity) - (Date.parse(b.start) || Infinity));
  }

  function timing(event) {
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
    let previous;
    function renderEvents() {
      const upcoming = eligible();
      const identity = JSON.stringify(upcoming.map(event => event.id));
      if (identity === previous) return;
      previous = identity;
      list.replaceChildren();
      if (!upcoming.length) list.append(element("p", "Check back for the next public event."));
      for (const event of upcoming) {
        const card = element("article", null, "community-card");
        card.id = event.id;
        const image = element("img");
        image.src = "../assets/" + event.poster;
        image.alt = event.title + " poster";
        image.width = 720;
        image.height = 900;
        image.loading = "lazy";
        const copy = element("div", null, "community-card-copy");
        copy.append(element("p", event.category, "community-kicker"), element("h2", event.title),
          element("p", timing(event)), element("p", event.description));
        if (event.visibility === "public" && /^https:\/\//i.test(event.registrationUrl || "")) {
          const link = element("a", "Registration details");
          link.href = event.registrationUrl;
          copy.append(link);
        }
        card.append(image, copy);
        list.append(card);
      }
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    }
    renderEvents();
    setInterval(renderEvents, 15000);
    document.addEventListener("visibilitychange", renderEvents);
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
    const current = featured.findIndex(event => event.id === selected);
    const index = current < 0 ? 0 : (current + direction + featured.length) % featured.length;
    const event = featured[index];
    if (selected !== event?.id) {
      selected = event?.id;
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
