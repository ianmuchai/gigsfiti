const state = {
  categories: [],
  workers: [],
  jobs: [],
  messages: [],
  summary: null,
  selectedMode: "physical",
  activeSkills: [],
  activeJobId: null,
  search: ""
};

const views = document.querySelectorAll(".view");
const routeLinks = document.querySelectorAll("[data-route]");
const sideNavLinks = document.querySelectorAll(".side-nav [data-route]");
const form = document.querySelector("#job-form");
const titleInput = document.querySelector("#job-title");
const categorySelect = document.querySelector("#job-category");
const budgetInput = document.querySelector("#budget");
const distanceInput = document.querySelector("#distance");
const budgetValue = document.querySelector("#budget-value");
const distanceValue = document.querySelector("#distance-value");
const locationInput = document.querySelector("#location");
const skillPills = document.querySelector("#skill-pills");
const matchCard = document.querySelector("#match-card");
const homeMatch = document.querySelector("#home-match");
const homeWorkerGrid = document.querySelector("#home-worker-grid");
const talentGrid = document.querySelector("#talent-grid");
const jobsList = document.querySelector("#jobs-list");
const messagesList = document.querySelector("#messages-list");
const dashboardGrid = document.querySelector("#dashboard-grid");
const pulseGrid = document.querySelector("#pulse-grid");
const modeButtons = document.querySelectorAll(".mode-chip");
const toast = document.querySelector("#toast");
const menuButton = document.querySelector(".menu-button");
const globalSearch = document.querySelector("#global-search");

function kes(amount) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }

  return payload;
}

function currentRequest() {
  return {
    title: titleInput.value.trim(),
    category: categorySelect.value,
    mode: state.selectedMode,
    budget: Number(budgetInput.value),
    distance: Number(distanceInput.value),
    location: locationInput.value.trim(),
    skills: state.activeSkills
  };
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setRoute(route) {
  const validRoutes = ["home", "post", "talent", "jobs", "messages", "dashboard"];
  const nextRoute = validRoutes.includes(route) ? route : "home";

  views.forEach((view) => view.classList.toggle("active", view.dataset.view === nextRoute));
  sideNavLinks.forEach((link) => link.classList.toggle("active", link.dataset.route === nextRoute));
  document.body.classList.remove("nav-open");

  if (window.location.hash !== `#${nextRoute}`) {
    history.pushState(null, "", `#${nextRoute}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateRangeLabels() {
  budgetValue.textContent = `${kes(budgetInput.value)} total`;
  distanceValue.textContent = `Within ${distanceInput.value} km`;
}

function renderCategoryOptions() {
  categorySelect.innerHTML = state.categories
    .map((category) => `<option value="${category.id}">${category.label}</option>`)
    .join("");
}

function renderSkillPills() {
  const category = state.categories.find((item) => item.id === categorySelect.value);
  skillPills.innerHTML = "";

  (category?.skills || []).forEach((skill) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `skill-pill${state.activeSkills.includes(skill) ? " active" : ""}`;
    button.textContent = skill;
    button.addEventListener("click", () => {
      if (state.activeSkills.includes(skill)) {
        state.activeSkills = state.activeSkills.filter((item) => item !== skill);
      } else {
        state.activeSkills = [...state.activeSkills, skill];
      }

      if (state.activeSkills.length === 0) {
        state.activeSkills = [skill];
      }

      renderSkillPills();
      refreshMatches();
    });
    skillPills.appendChild(button);
  });
}

function syncCategoryDefaults() {
  const category = state.categories.find((item) => item.id === categorySelect.value);
  state.activeSkills = [...(category?.skills || [])];
  renderSkillPills();
}

async function refreshMatches() {
  const payload = await api("/api/match", {
    method: "POST",
    body: JSON.stringify(currentRequest())
  });
  state.workers = payload.workers;
  renderMatch();
  renderHomeMatch();
  renderHomeWorkers();
  renderTalentGrid();
}

function renderPulse() {
  if (!state.summary) return;

  const items = [
    ["Active jobs", state.summary.activeJobs],
    ["Verified workers", state.summary.workers],
    ["Avg. rating", `${state.summary.averageRating}/5`],
    ["Median reply", `${state.summary.medianResponse} min`]
  ];

  pulseGrid.innerHTML = items
    .map(
      ([label, value]) => `
        <article>
          <strong>${value}</strong>
          <span>${label}</span>
        </article>
      `
    )
    .join("");
}

function workerLocation(worker) {
  return worker.remote ? "Remote-ready" : `${worker.location} - ${worker.distance} km away`;
}

function renderMatch() {
  const [topMatch] = state.workers;
  if (!topMatch) {
    matchCard.innerHTML = `<p>No matches yet. Adjust the request and try again.</p>`;
    return;
  }

  matchCard.innerHTML = `
    <div class="match-card-header">
      <div>
        <p class="eyebrow">Top match</p>
        <h3>${topMatch.name}</h3>
      </div>
      <span class="match-badge">${topMatch.score}% fit</span>
    </div>

    <div class="profile-head">
      <span class="worker-avatar">${initials(topMatch.name)}</span>
      <div>
        <p class="worker-role">${topMatch.role}</p>
        <p class="location-line">${workerLocation(topMatch)}</p>
      </div>
    </div>

    <div class="profile-rate">
      <div>
        <strong>${kes(topMatch.rate)}</strong>
        <span>typical rate</span>
      </div>
      <span class="availability">${topMatch.availability}</span>
    </div>

    <p class="match-meta">
      Best fit for ${categorySelect.options[categorySelect.selectedIndex]?.text.toLowerCase()} near
      ${locationInput.value || "your area"} with a budget of ${kes(budgetInput.value)}.
    </p>

    <div class="meta-grid">
      <article>
        <strong>${topMatch.rating.toFixed(1)} / 5</strong>
        <span>rating</span>
      </article>
      <article>
        <strong>${topMatch.jobs}</strong>
        <span>completed gigs</span>
      </article>
      <article>
        <strong>${state.activeSkills.filter((skill) => topMatch.skills.includes(skill)).length}/${state.activeSkills.length}</strong>
        <span>skills matched</span>
      </article>
    </div>

    <div class="tag-row">
      ${topMatch.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
    </div>

    <div class="button-row">
      <button class="primary-button" data-action="contact" data-worker-id="${topMatch.id}">Ping ${topMatch.name.split(" ")[0]}</button>
      <button class="secondary-button" data-route="talent">Compare backups</button>
    </div>
  `;
}

function renderHomeMatch() {
  const [worker] = state.workers;
  if (!worker) return;

  homeMatch.innerHTML = `
    <div class="profile-head">
      <span class="worker-avatar">${initials(worker.name)}</span>
      <div>
        <p class="eyebrow">Best available now</p>
        <h3>${worker.name}</h3>
        <p class="worker-role">${worker.role}</p>
      </div>
    </div>
    <div class="profile-rate">
      <div>
        <strong>${kes(worker.rate)}</strong>
        <span>typical rate</span>
      </div>
      <span class="match-badge">${worker.score}% fit</span>
    </div>
    <button class="secondary-button full-width" data-route="post">Tune match</button>
  `;
}

function renderHomeWorkers() {
  if (!homeWorkerGrid) return;

  homeWorkerGrid.innerHTML = state.workers
    .slice(0, 6)
    .map(
      (worker) => `
        <article class="home-worker-card">
          <div class="profile-head">
            <span class="worker-avatar">${initials(worker.name)}</span>
            <div>
              <h3>${worker.name}</h3>
              <p class="worker-role">${worker.role}</p>
            </div>
          </div>
          <div class="compact-meta">
            <span>${kes(worker.rate)}</span>
            <span>${worker.rating.toFixed(1)} rating</span>
            <span>${worker.remote ? "Remote" : worker.location}</span>
          </div>
          <div class="tag-row">
            ${worker.skills.slice(0, 2).map((skill) => `<span class="tag">${skill}</span>`).join("")}
          </div>
          <button class="secondary-button full-width" data-action="contact" data-worker-id="${worker.id}">Contact</button>
        </article>
      `
    )
    .join("");
}

function filteredWorkers() {
  const query = state.search.toLowerCase();
  if (!query) return state.workers;

  return state.workers.filter((worker) =>
    [worker.name, worker.role, worker.location, ...worker.skills].join(" ").toLowerCase().includes(query)
  );
}

function renderTalentGrid() {
  const workers = filteredWorkers();
  talentGrid.innerHTML = workers
    .map(
      (worker, index) => `
        <article class="talent-card${index === 0 ? " featured" : ""}">
          <div class="talent-topline">
            <div class="profile-head">
              <span class="worker-avatar">${initials(worker.name)}</span>
              <div>
                <h3>${worker.name}</h3>
                <p class="worker-role">${worker.role}</p>
              </div>
            </div>
            <span class="match-badge">${worker.score}% fit</span>
          </div>
          <div class="profile-rate">
            <div>
              <strong>${kes(worker.rate)}</strong>
              <span>rate</span>
            </div>
            <div>
              <strong>${worker.rating.toFixed(1)}</strong>
              <span>rating</span>
            </div>
          </div>
          <p class="location-line">${workerLocation(worker)}</p>
          <p>${worker.jobs} completed gigs with verified strengths for task-based hiring.</p>
          <div class="tag-row">
            ${worker.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
          </div>
          <div class="button-row">
            <button class="primary-button" data-action="contact" data-worker-id="${worker.id}">Contact</button>
            <button class="secondary-button" data-route="post">Build request</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderJobs() {
  jobsList.innerHTML = state.jobs
    .map(
      (job) => `
        <article class="list-item">
          <div>
            <h3>${job.title}</h3>
            <p>${job.categoryLabel} - ${job.location} - ${kes(job.budget)}</p>
            <div class="tag-row">
              <span class="tag">${job.status}</span>
              <span class="tag">${job.mode === "remote" ? "Remote" : "Physical"}</span>
              ${job.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
            </div>
          </div>
          <div class="list-actions">
            <span class="match-badge">${job.worker ? job.worker.name : "No match"}</span>
            <button class="secondary-button" data-action="open-job" data-job-id="${job.id}">Open</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderMessages() {
  messagesList.innerHTML = state.messages.length
    ? state.messages
        .map(
          (message) => `
            <article class="list-item">
              <div>
                <h3>${message.worker?.name || "Gig Fiti"}</h3>
                <p>${message.text}</p>
                <span class="field-note">${new Date(message.createdAt).toLocaleString()}</span>
              </div>
              <button class="secondary-button" data-route="jobs">View jobs</button>
            </article>
          `
        )
        .join("")
    : `<article class="empty-state">No messages yet. Contact a worker to start a thread.</article>`;
}

function renderDashboard() {
  if (!state.summary) return;

  const cards = [
    ["Active jobs", state.summary.activeJobs],
    ["Verified workers", state.summary.workers],
    ["Average rating", `${state.summary.averageRating}/5`],
    ["Completed gigs", state.summary.completedGigs],
    ["Median response", `${state.summary.medianResponse} min`],
    ["Currency", "KES"]
  ];

  dashboardGrid.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="dashboard-card">
          <strong>${value}</strong>
          <span>${label}</span>
        </article>
      `
    )
    .join("");
}

async function refreshBackOffice() {
  const [jobsPayload, messagesPayload, summaryPayload] = await Promise.all([
    api("/api/jobs"),
    api("/api/messages"),
    api("/api/summary")
  ]);

  state.jobs = jobsPayload.jobs;
  state.messages = messagesPayload.messages;
  state.summary = summaryPayload;
  renderJobs();
  renderMessages();
  renderDashboard();
  renderPulse();
}

async function submitJob(event) {
  event.preventDefault();
  const payload = await api("/api/jobs", {
    method: "POST",
    body: JSON.stringify(currentRequest())
  });

  state.activeJobId = payload.job.id;
  state.workers = payload.matches;
  await refreshBackOffice();
  renderMatch();
  renderHomeWorkers();
  renderTalentGrid();
  showToast("Job posted and matches are ready.");
  setRoute("jobs");
}

async function contactWorker(workerId) {
  const worker = state.workers.find((item) => item.id === Number(workerId));
  const payload = {
    jobId: state.activeJobId,
    title: titleInput.value.trim() || "a new gig"
  };

  await api(`/api/workers/${workerId}/contact`, {
    method: "POST",
    body: JSON.stringify(payload)
  });

  await refreshBackOffice();
  showToast(`${worker?.name || "Worker"} has been pinged.`);
  setRoute("messages");
}

function openJob(jobId) {
  const job = state.jobs.find((item) => item.id === Number(jobId));
  if (!job) return;

  titleInput.value = job.title;
  categorySelect.value = job.category;
  state.selectedMode = job.mode;
  budgetInput.value = job.budget;
  locationInput.value = job.location;
  state.activeSkills = [...job.skills];
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === job.mode));
  state.activeJobId = job.id;
  updateRangeLabels();
  renderSkillPills();
  refreshMatches();
  setRoute("post");
}

async function init() {
  const categoryPayload = await api("/api/categories");
  state.categories = categoryPayload.categories;
  renderCategoryOptions();
  syncCategoryDefaults();
  updateRangeLabels();
  await refreshMatches();
  await refreshBackOffice();
  setRoute((window.location.hash || "#home").replace("#", ""));
}

routeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setRoute(link.dataset.route);
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedMode = button.dataset.mode;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    refreshMatches();
  });
});

categorySelect.addEventListener("change", () => {
  syncCategoryDefaults();
  refreshMatches();
});

budgetInput.addEventListener("input", () => {
  updateRangeLabels();
  refreshMatches();
});

distanceInput.addEventListener("input", () => {
  updateRangeLabels();
  refreshMatches();
});

locationInput.addEventListener("input", refreshMatches);
titleInput.addEventListener("input", () => {
  state.activeJobId = null;
});
form.addEventListener("submit", submitJob);

globalSearch.addEventListener("input", () => {
  state.search = globalSearch.value;
  renderTalentGrid();
  setRoute("talent");
});

menuButton.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    event.preventDefault();
    setRoute(routeButton.dataset.route);
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  if (actionButton.dataset.action === "contact") {
    contactWorker(actionButton.dataset.workerId);
  }

  if (actionButton.dataset.action === "open-job") {
    openJob(actionButton.dataset.jobId);
  }
});

window.addEventListener("popstate", () => setRoute((window.location.hash || "#home").replace("#", "")));

init().catch((error) => {
  showToast(error.message);
});
