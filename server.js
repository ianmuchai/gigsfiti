const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

const categories = [
  { id: "garden", label: "Garden work", skills: ["Landscaping", "Pruning", "Irrigation"] },
  { id: "delivery", label: "Delivery run", skills: ["Motorbike delivery", "Same-day errands", "Cash handling"] },
  { id: "cleaning", label: "House cleaning", skills: ["Deep cleaning", "Laundry", "Move-out reset"] },
  { id: "assistant", label: "Virtual assistant", skills: ["Calendar management", "Inbox triage", "Research"] },
  { id: "design", label: "Graphic design", skills: ["Canva", "Adobe Creative Suite", "Social graphics"] },
  { id: "developer", label: "Frontend development", skills: ["React", "Responsive UI", "APIs"] }
];

const workers = [
  {
    id: 1,
    name: "Amina W.",
    role: "Garden and outdoor specialist",
    location: "Westlands",
    category: "garden",
    remote: false,
    rate: 2800,
    distance: 3,
    rating: 4.9,
    jobs: 148,
    responseMinutes: 14,
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
    rate: 1600,
    distance: 5,
    rating: 4.8,
    jobs: 214,
    responseMinutes: 6,
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
    rate: 2200,
    distance: 4,
    rating: 4.9,
    jobs: 192,
    responseMinutes: 18,
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
    rate: 3200,
    distance: 0,
    rating: 4.7,
    jobs: 123,
    responseMinutes: 22,
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
    rate: 5200,
    distance: 0,
    rating: 5,
    jobs: 97,
    responseMinutes: 31,
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
    rate: 7600,
    distance: 0,
    rating: 4.9,
    jobs: 86,
    responseMinutes: 25,
    availability: "Available this afternoon",
    skills: ["React", "Responsive UI", "APIs"],
    verified: ["Code tested", "Startup experience"]
  },
  {
    id: 7,
    name: "Brian M.",
    role: "Event setup and moving crew",
    location: "Parklands",
    category: "delivery",
    remote: false,
    rate: 2400,
    distance: 6,
    rating: 4.8,
    jobs: 132,
    responseMinutes: 12,
    availability: "Available in 1 hr",
    skills: ["Same-day errands", "Cash handling", "Heavy lifting"],
    verified: ["ID verified", "Two-person crew"]
  },
  {
    id: 8,
    name: "Lydia A.",
    role: "Office and Airbnb cleaning",
    location: "Kileleshwa",
    category: "cleaning",
    remote: false,
    rate: 2600,
    distance: 7,
    rating: 4.9,
    jobs: 176,
    responseMinutes: 16,
    availability: "Available this evening",
    skills: ["Deep cleaning", "Move-out reset", "Laundry"],
    verified: ["Top rated", "Supplies ready"]
  },
  {
    id: 9,
    name: "Kevin T.",
    role: "Social media content designer",
    location: "Remote",
    category: "design",
    remote: true,
    rate: 4300,
    distance: 0,
    rating: 4.8,
    jobs: 74,
    responseMinutes: 19,
    availability: "Open today",
    skills: ["Canva", "Social graphics", "Adobe Creative Suite"],
    verified: ["Portfolio approved", "Fast responder"]
  },
  {
    id: 10,
    name: "Grace W.",
    role: "Admin and research assistant",
    location: "Remote",
    category: "assistant",
    remote: true,
    rate: 2900,
    distance: 0,
    rating: 4.7,
    jobs: 118,
    responseMinutes: 21,
    availability: "Available tomorrow",
    skills: ["Research", "Calendar management", "Inbox triage"],
    verified: ["Remote verified", "Reference checked"]
  },
  {
    id: 11,
    name: "Samuel N.",
    role: "Garden maintenance lead",
    location: "Karen",
    category: "garden",
    remote: false,
    rate: 3600,
    distance: 12,
    rating: 4.9,
    jobs: 101,
    responseMinutes: 28,
    availability: "Open this week",
    skills: ["Landscaping", "Irrigation", "Pruning"],
    verified: ["Tools ready", "Repeat clients"]
  },
  {
    id: 12,
    name: "Irene C.",
    role: "Frontend and landing page builder",
    location: "Remote",
    category: "developer",
    remote: true,
    rate: 6900,
    distance: 0,
    rating: 4.8,
    jobs: 63,
    responseMinutes: 34,
    availability: "Available this week",
    skills: ["React", "Responsive UI", "APIs"],
    verified: ["Code tested", "Portfolio approved"]
  }
];

let jobs = [
  {
    id: 1001,
    title: "Balcony garden reset",
    category: "garden",
    mode: "physical",
    budget: 4500,
    location: "Westlands, Nairobi",
    skills: ["Landscaping", "Pruning"],
    status: "Matched",
    createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    matchedWorkerId: 1
  },
  {
    id: 1002,
    title: "Same-day client package delivery",
    category: "delivery",
    mode: "physical",
    budget: 2200,
    location: "Kilimani, Nairobi",
    skills: ["Motorbike delivery", "Same-day errands"],
    status: "Contacted",
    createdAt: new Date(Date.now() - 1000 * 60 * 94).toISOString(),
    matchedWorkerId: 2
  }
];

let messages = [
  {
    id: 501,
    workerId: 1,
    jobId: 1001,
    text: "Amina is available and can bring pruning tools.",
    createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString()
  }
];

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Internal server error");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream"
    });
    res.end(content);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function scoreWorker(worker, request) {
  const activeSkills = request.skills && request.skills.length ? request.skills : [];
  const skillMatches = activeSkills.filter((skill) => worker.skills.includes(skill)).length;
  const skillScore = activeSkills.length ? skillMatches / activeSkills.length : 0.5;
  const budgetGap = Math.abs(Number(request.budget || 0) - worker.rate);
  const budgetScore = Math.max(0, 1 - budgetGap / 8500);
  const distanceScore =
    request.mode === "remote" ? 1 : Math.max(0, 1 - worker.distance / Math.max(Number(request.distance || 1), 1));
  const modeScore = request.mode === "remote" ? (worker.remote ? 1 : 0.16) : (worker.remote ? 0.12 : 1);
  const categoryScore = worker.category === request.category ? 1 : 0.24;
  const ratingScore = worker.rating / 5;

  return Math.round(
    (skillScore * 0.3 +
      categoryScore * 0.2 +
      budgetScore * 0.18 +
      distanceScore * 0.14 +
      modeScore * 0.1 +
      ratingScore * 0.08) *
      100
  );
}

function rankedWorkers(request) {
  return workers
    .map((worker) => ({ ...worker, score: scoreWorker(worker, request) }))
    .sort((a, b) => b.score - a.score);
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/categories") {
    sendJson(res, 200, { categories });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/workers") {
    const request = {
      category: url.searchParams.get("category") || "garden",
      mode: url.searchParams.get("mode") || "physical",
      budget: Number(url.searchParams.get("budget") || 4500),
      distance: Number(url.searchParams.get("distance") || 10),
      skills: (url.searchParams.get("skills") || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    };
    sendJson(res, 200, { workers: rankedWorkers(request) });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/jobs") {
    const enrichedJobs = jobs.map((job) => ({
      ...job,
      categoryLabel: categories.find((category) => category.id === job.category)?.label || job.category,
      worker: workers.find((worker) => worker.id === job.matchedWorkerId) || null
    }));
    sendJson(res, 200, { jobs: enrichedJobs });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/messages") {
    sendJson(res, 200, {
      messages: messages.map((message) => ({
        ...message,
        worker: workers.find((worker) => worker.id === message.workerId) || null,
        job: jobs.find((job) => job.id === message.jobId) || null
      }))
    });
    return true;
  }

  if (req.method === "GET" && url.pathname === "/api/summary") {
    const activeJobs = jobs.filter((job) => job.status !== "Closed").length;
    const averageRating = workers.reduce((total, worker) => total + worker.rating, 0) / workers.length;
    const medianResponse = workers
      .map((worker) => worker.responseMinutes)
      .sort((a, b) => a - b)[Math.floor(workers.length / 2)];

    sendJson(res, 200, {
      activeJobs,
      workers: workers.length,
      averageRating: Number(averageRating.toFixed(1)),
      medianResponse,
      completedGigs: workers.reduce((total, worker) => total + worker.jobs, 0)
    });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/match") {
    const request = await readBody(req);
    sendJson(res, 200, { workers: rankedWorkers(request) });
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/jobs") {
    const request = await readBody(req);
    const matches = rankedWorkers(request);
    const newJob = {
      id: Date.now(),
      title: request.title || `${categories.find((category) => category.id === request.category)?.label || "Gig"} request`,
      category: request.category,
      mode: request.mode,
      budget: Number(request.budget || 0),
      location: request.location || "Nairobi",
      skills: request.skills || [],
      status: "Matched",
      createdAt: new Date().toISOString(),
      matchedWorkerId: matches[0]?.id || null
    };

    jobs = [newJob, ...jobs];
    sendJson(res, 201, { job: newJob, matches });
    return true;
  }

  const contactMatch = url.pathname.match(/^\/api\/workers\/(\d+)\/contact$/);
  if (req.method === "POST" && contactMatch) {
    const request = await readBody(req);
    const workerId = Number(contactMatch[1]);
    const worker = workers.find((item) => item.id === workerId);

    if (!worker) {
      sendJson(res, 404, { error: "Worker not found" });
      return true;
    }

    const message = {
      id: Date.now(),
      workerId,
      jobId: request.jobId || null,
      text: `${worker.name} was pinged for ${request.title || "a new gig"}.`,
      createdAt: new Date().toISOString()
    };

    messages = [message, ...messages];
    jobs = jobs.map((job) => (job.id === request.jobId ? { ...job, status: "Contacted" } : job));
    sendJson(res, 201, { message, worker });
    return true;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "API route not found" });
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (await handleApi(req, res, url)) {
      return;
    }
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Bad request" });
    return;
  }

  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      sendFile(path.join(PUBLIC_DIR, "index.html"), res);
      return;
    }

    sendFile(filePath, res);
  });
});

server.listen(PORT, () => {
  console.log(`Gig Fiti is running at http://localhost:${PORT}`);
});
