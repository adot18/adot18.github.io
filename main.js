const S = window.SITE;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("name").textContent = S.name;
$("title").textContent = S.title;
$("location").textContent = S.location;
$("description").textContent = S.description;
$("linkedin").href = S.links.linkedin;
$("github").href = S.links.github;
if (S.links.email) {
  const addr = S.links.email;
  const subj = encodeURIComponent("Hello from your website");
  const to = encodeURIComponent(addr);
  const btn = $("email"), menu = $("email-menu"), copy = $("email-copy");
  $("email-addr").textContent = addr;
  $("email-gmail").href = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subj}`;
  $("email-outlook").href = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subj}`;
  $("email-app").href = `mailto:${addr}?subject=${subj}`;
  const setOpen = (open) => { menu.hidden = !open; btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", (e) => { e.stopPropagation(); setOpen(menu.hidden); });
  document.addEventListener("click", (e) => { if (!$("email-wrap").contains(e.target)) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(addr); copy.textContent = "Copied!"; }
    catch { const r = document.createRange(); r.selectNodeContents($("email-addr")); getSelection().removeAllRanges(); getSelection().addRange(r); copy.textContent = "Press ⌘/Ctrl+C"; }
    setTimeout(() => (copy.textContent = "Copy address"), 1800);
  });
} else $("email-wrap").remove();
$("footer").textContent = `© ${new Date().getFullYear()} ${S.name}`;

if (S.interests && S.interests.items.length) {
  $("interests-intro").textContent = S.interests.intro || "";
  $("interests").innerHTML = S.interests.items.map((i) => `<li>${esc(i)}</li>`).join("");
} else $("interests-section").remove();

$("experience").innerHTML = S.experience.map((e) => `
  <article class="job">
    <div class="job-head">
      <div><h3>${esc(e.company)}</h3><p class="job-role">${esc(e.role)}</p></div>
      <p class="job-meta mono">${esc(e.dates)}<br>${esc(e.place)}</p>
    </div>
    <ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
  </article>`).join("");

if (S.education) $("education").innerHTML = `<span class="mono">Education</span> ${esc(S.education.school)}, ${esc(S.education.degree)}`;

function renderProjects(filter) {
  $("projects").innerHTML = S.projects
    .filter((p) => filter === "all" || p.type === filter)
    .map((p) => `
    <a class="card" href="${esc(p.url)}" target="_blank" rel="noopener">
      <span class="badge mono ${p.type}">${p.type === "paper" ? "Paper" : "Code"}</span>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.blurb)}</p>
      <div class="tags">${(p.tags || []).map((t) => `<span class="mono">${esc(t)}</span>`).join("")}</div>
      <span class="arrow" aria-hidden="true">↗</span>
    </a>`).join("");
}
renderProjects("all");

document.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === b));
  renderProjects(b.dataset.filter);
}));
