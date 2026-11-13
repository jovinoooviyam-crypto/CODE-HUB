(function () {

  const data    = window.TEAM_UNITY_COLLABORATORS || {};
  const members = Array.isArray(data.members) ? data.members : [];

  const list  = document.getElementById("collabList");
  const empty = document.getElementById("collabEmpty");

  // Escape text so edits in team-data.js can't break the HTML
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function initials(name) {
    return String(name || "?")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  function linkItem(href, label) {
    return `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`;
  }

  function buildLinks(m) {
    const links = [];
    if (m.email)     links.push(`<a href="mailto:${esc(m.email)}">Email</a>`);
    if (m.phone)     links.push(`<a href="tel:${esc(String(m.phone).replace(/\s+/g, ""))}">Call</a>`);
    if (m.website)   links.push(linkItem(m.website, "Website"));
    if (m.instagram) links.push(linkItem(m.instagram, "Instagram"));
    if (m.linkedin)  links.push(linkItem(m.linkedin, "LinkedIn"));
    return links.join("");
  }

  function buildCard(m) {
    const avatar = m.photo
      ? `<img src="${esc(m.photo)}" alt="${esc(m.name)}">`
      : `<span>${esc(initials(m.name))}</span>`;

    const links = buildLinks(m);

    return `
      <article class="collab-card">
        <div class="collab-avatar">${avatar}</div>
        <div class="collab-info">
          <h2>${esc(m.name)}</h2>
          ${m.role ? `<p class="collab-role">${esc(m.role)}</p>` : ""}
          ${m.bio  ? `<p class="collab-bio">${esc(m.bio)}</p>` : ""}
          ${links  ? `<div class="collab-links">${links}</div>` : ""}
        </div>
      </article>
    `;
  }

  // Fill header text
  document.getElementById("collabEyebrow").textContent = data.eyebrow || "";
  document.getElementById("collabTitle").textContent   = data.title   || "";
  document.getElementById("collabIntro").textContent   = data.intro   || "";

  // Render members
  if (!members.length) {
    empty.hidden = false;
  } else {
    list.innerHTML = members.map(buildCard).join("");
  }

})();
