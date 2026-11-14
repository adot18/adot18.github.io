const S = window.SITE;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("name").textContent = S.name;
$("title").textContent = S.title;
$("location").textContent = S.location;
$("description").textContent = S.description;
$("linkedin").href = S.links.linkedin;
$("github").href = S.links.github;
$("footer").textContent = `© ${new Date().getFullYear()} ${S.name}`;

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
