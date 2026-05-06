const workerData = [
  {
    id: 1,
    name: "Amina W.",
    role: "Garden and outdoor specialist",
    location: "Westlands",
    category: "garden",
    remote: false,
    rate: 95,
    distance: 3,
    rating: 4.9,
    jobs: 148,
    availability: "Available in 45 min",
    skills: ["Landscaping", "Pruning", "Irrigation"],
    verified: ["Background checked", "Tools ready"]
  },
  {
    id: 2,
    name: "David K.",
    role: "Errands and local delivery",
    location: "Kilimani",
    category: "delivery",
    remote: false,
    rate: 60,
    distance: 5,
    rating: 4.8,
    jobs: 214,
    availability: "Available now",
    skills: ["Motorbike delivery", "Same-day errands", "Cash handling"],
    verified: ["ID verified", "Fast responder"]
  },
  {
    id: 3,
    name: "Martha N.",
    role: "Residential cleaning pro",
    location: "Lavington",
    category: "cleaning",
    remote: false,
    rate: 80,
    distance: 4,
    rating: 4.9,
    jobs: 192,
    availability: "Available tomorrow",
    skills: ["Deep cleaning", "Laundry", "Move-out reset"],
    verified: ["Top rated", "Repeat clients"]
  },
  {
    id: 4,
    name: "Noah S.",
    role: "Remote executive assistant",
    location: "Remote",
    category: "assistant",
    remote: true,
    rate: 110,
    distance: 0,
    rating: 4.7,
    jobs: 123,
    availability: "Available today",
    skills: ["Calendar management", "Inbox triage", "Research"],
    verified: ["Remote verified", "English fluent"]
  },
  {
    id: 5,
    name: "Priya M.",
    role: "Brand and social designer",
    location: "Remote",
    category: "design",
    remote: true,
    rate: 140,
    distance: 0,
    rating: 5,
    jobs: 97,
    availability: "Open this week",
    skills: ["Canva", "Adobe Creative Suite", "Social graphics"],
    verified: ["Portfolio approved", "Top rated"]
  },
  {
    id: 6,
    name: "James O.",
    role: "Frontend developer",
    location: "Remote",
    category: "developer",
    remote: true,
    rate: 180,
    distance: 0,
    rating: 4.9,
    jobs: 86,
    availability: "Available this afternoon",
    skills: ["React", "Responsive UI", "APIs"],
    verified: ["Code tested", "Startup experience"]
  }
];

const skillMap = {
  garden: ["Landscaping", "Pruning", "Irrigation"],
  delivery: ["Motorbike delivery", "Same-day errands", "Cash handling"],
  cleaning: ["Deep cleaning", "Laundry", "Move-out reset"],
  assistant: ["Calendar management", "Inbox triage", "Research"],
  design: ["Canva", "Adobe Creative Suite", "Social graphics"],
  developer: ["React", "Responsive UI", "APIs"]
};

const form = document.querySelector("#job-form");
const categorySelect = document.querySelector("#job-category");
const budgetInput = document.querySelector("#budget");
const distanceInput = document.querySelector("#distance");
const budgetValue = document.querySelector("#budget-value");
const distanceValue = document.querySelector("#distance-value");
const locationInput = document.querySelector("#location");
const skillPills = document.querySelector("#skill-pills");
const matchCard = document.querySelector("#match-card");
const talentGrid = document.querySelector("#talent-grid");
const modeButtons = document.querySelectorAll(".mode-chip");
const scrollButtons = document.querySelectorAll("[data-scroll]");

let selectedMode = "physical";
let activeSkills = [...skillMap[categorySelect.value]];

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function updateRangeLabels() {
  budgetValue.textContent = `$${budgetInput.value} total`;
  distanceValue.textContent = `Within ${distanceInput.value} miles`;
}

function renderSkillPills() {
  skillPills.innerHTML = "";

  skillMap[categorySelect.value].forEach((skill) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `skill-pill${activeSkills.includes(skill) ? " active" : ""}`;
    button.textContent = skill;
    button.addEventListener("click", () => {
      if (activeSkills.includes(skill)) {
        activeSkills = activeSkills.filter((item) => item !== skill);
      } else {
        activeSkills = [...activeSkills, skill];
      }

      if (activeSkills.length === 0) {
        activeSkills = [skill];
      }

      renderSkillPills();
      renderMatch();
    });
    skillPills.appendChild(button);
  });
}

function scoreWorker(worker) {
  const budget = Number(budgetInput.value);
  const maxDistance = Number(distanceInput.value);
  const skillMatches = activeSkills.filter((skill) => worker.skills.includes(skill)).length;
  const skillScore = skillMatches / activeSkills.length;
  const rateGap = Math.abs(budget - worker.rate);
  const budgetScore = Math.max(0, 1 - rateGap / 220);
  const distanceScore =
    selectedMode === "remote" ? 1 : Math.max(0, 1 - worker.distance / Math.max(maxDistance, 1));
  const remoteFit =
    selectedMode === "remote" ? (worker.remote ? 1 : 0.18) : (worker.remote ? 0.15 : 1);
  const ratingScore = worker.rating / 5;

  const total =
    skillScore * 0.38 +
    budgetScore * 0.22 +
    distanceScore * 0.18 +
    remoteFit * 0.12 +
    ratingScore * 0.1;

  return Math.round(total * 100);
}

function getRankedWorkers() {
  return workerData
    .map((worker) => ({ ...worker, score: scoreWorker(worker) }))
    .sort((a, b) => b.score - a.score);
}

function renderMatch() {
  const [topMatch] = getRankedWorkers();

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
        <p class="location-line">${selectedMode === "remote" ? "Remote-ready" : `${topMatch.location} • ${topMatch.distance} miles away`}</p>
      </div>
    </div>

    <div class="profile-rate">
      <div>
        <strong>$${topMatch.rate}</strong>
        <span>typical rate</span>
      </div>
      <span class="availability">${topMatch.availability}</span>
    </div>

    <p class="match-meta">
      Best fit for a ${categorySelect.options[categorySelect.selectedIndex].text.toLowerCase()} request near
      ${locationInput.value || "your area"} with a budget of $${budgetInput.value}.
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
        <strong>${activeSkills.filter((skill) => topMatch.skills.includes(skill)).length}/${activeSkills.length}</strong>
        <span>skills matched</span>
      </article>
    </div>

    <div class="tag-row">
      ${topMatch.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
    </div>

    <div class="tag-row">
      ${topMatch.verified.map((tag) => `<span class="tag">${tag}</span>`).join("")}
    </div>

    <button class="primary-button full-width">Ping ${topMatch.name.split(" ")[0]}</button>
  `;
}

function renderTalentGrid() {
  const ranked = getRankedWorkers();
  talentGrid.innerHTML = ranked
    .map((worker, index) => {
      return `
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
              <strong>$${worker.rate}</strong>
              <span>rate</span>
            </div>
            <div>
              <strong>${worker.rating.toFixed(1)}</strong>
              <span>rating</span>
            </div>
          </div>
          <p class="location-line">${worker.remote ? "Remote" : `${worker.location} • ${worker.distance} miles away`}</p>
          <p>${worker.jobs} completed gigs with verified strengths that align with task-based hiring.</p>
          <div class="tag-row">
            ${worker.skills.map((skill) => `<span class="tag">${skill}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function syncCategoryDefaults() {
  activeSkills = [...skillMap[categorySelect.value]];
  renderSkillPills();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedMode = button.dataset.mode;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderMatch();
    renderTalentGrid();
  });
});

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

categorySelect.addEventListener("change", () => {
  syncCategoryDefaults();
  renderMatch();
  renderTalentGrid();
});

budgetInput.addEventListener("input", () => {
  updateRangeLabels();
  renderMatch();
  renderTalentGrid();
});

distanceInput.addEventListener("input", () => {
  updateRangeLabels();
  renderMatch();
  renderTalentGrid();
});

locationInput.addEventListener("input", renderMatch);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderMatch();
  renderTalentGrid();
  matchCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

updateRangeLabels();
syncCategoryDefaults();
renderMatch();
renderTalentGrid();
