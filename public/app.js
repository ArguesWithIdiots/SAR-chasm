const narrative = document.querySelector("#narrative");
const confirmation = document.querySelector("#confirmation");
const analyzeButton = document.querySelector("#analyzeButton");
const clearButton = document.querySelector("#clearButton");
const exampleButton = document.querySelector("#exampleButton");
const characterCount = document.querySelector("#characterCount");
const sensitiveWarning = document.querySelector("#sensitiveWarning");
const apiStatus = document.querySelector("#apiStatus");
const resultsPanel = document.querySelector("#resultsPanel");
const emptyState = document.querySelector("#emptyState");
const loadingState = document.querySelector("#loadingState");
const errorState = document.querySelector("#errorState");
const scorecard = document.querySelector("#scorecard");
const errorMessage = document.querySelector("#errorMessage");
const overallBadge = document.querySelector("#overallBadge");
const summary = document.querySelector("#summary");
const categoryList = document.querySelector("#categoryList");
const resultDisclaimer = document.querySelector("#resultDisclaimer");
const themeToggle = document.querySelector("#themeToggle");
const themeLabel = document.querySelector("#themeLabel");
const scoreCount = document.querySelector("#scoreCount");
const copyButton = document.querySelector("#copyButton");
const reviewAnotherButton = document.querySelector("#reviewAnotherButton");
const copyStatus = document.querySelector("#copyStatus");
const inputGuidance = document.querySelector("#inputGuidance");

const minimumNarrativeLength = 80;
const maximumNarrativeLength = 20000;
const themePreferenceKey = "sar-chasm-theme";
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
let currentScorecard = null;

const syntheticExample = `Harbor Community Bank identified repeated cash deposits by Jordan Avery into fabricated checking account ending 1042 at its Northport, Oregon branches. From January 8 through February 19, 2026, Avery made 18 cash deposits totaling $171,450; 16 deposits ranged from $9,100 to $9,900 and occurred at four branches, often on consecutive business days. On January 22, Avery deposited $9,600 at the Northport Main branch and $9,700 at the River Road branch 47 minutes later. The activity was inconsistent with the account's stated purpose of receiving payroll from a landscaping business, which averaged $4,200 in monthly electronic deposits during the prior six months. Within one business day of 14 cash deposits, funds were transferred to fabricated brokerage account ending 8821. The repeated below-threshold cash deposits across multiple branches, followed by rapid transfers, appear consistent with potential structuring intended to avoid reporting requirements. The bank is reporting $171,450 in suspicious activity for the period January 8 through February 19, 2026.`;

const sensitivePatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b(?:\d[ -]*?){13,19}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/,
  /\b(?:SAR (?:was |has been |will be )?filed|filing date|FinCEN confirmation)\b/i,
];

function setView(view) {
  const views = { empty: emptyState, loading: loadingState, error: errorState, scorecard };
  Object.entries(views).forEach(([name, element]) => {
    element.hidden = name !== view;
  });
  resultsPanel.setAttribute("aria-busy", String(view === "loading"));
}

function readThemePreference() {
  try {
    const preference = localStorage.getItem(themePreferenceKey);
    return preference === "light" || preference === "dark" ? preference : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  const dark = theme === "dark";
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} mode`);
  themeLabel.textContent = dark ? "Light mode" : "Dark mode";
}

function toggleTheme() {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  try {
    localStorage.setItem(themePreferenceKey, theme);
  } catch {
    // The selected theme still applies for this page when storage is unavailable.
  }
}

function updateInputState() {
  const length = narrative.value.length;
  const overage = Math.max(0, length - maximumNarrativeLength);
  characterCount.textContent = overage
    ? `${length.toLocaleString()} / 20,000 characters · ${overage.toLocaleString()} over limit`
    : `${length.toLocaleString()} / 20,000 characters`;
  characterCount.classList.toggle("over-limit", overage > 0);
  analyzeButton.disabled =
    length < minimumNarrativeLength || length > maximumNarrativeLength || !confirmation.checked;
  if (length < minimumNarrativeLength) {
    inputGuidance.textContent = `Enter at least ${minimumNarrativeLength} characters to begin.`;
  } else if (length > maximumNarrativeLength) {
    inputGuidance.textContent = `Remove ${overage.toLocaleString()} characters to analyze.`;
  } else if (!confirmation.checked) {
    inputGuidance.textContent = "Confirm that the narrative is fabricated to continue.";
  } else {
    inputGuidance.textContent = "Ready to analyze. Ctrl/Cmd + Enter also works.";
  }
  inputGuidance.classList.toggle("ready", !analyzeButton.disabled);
  sensitiveWarning.hidden = !sensitivePatterns.some((pattern) => pattern.test(narrative.value));
}

async function checkStatus() {
  try {
    const response = await fetch("/api/status", { cache: "no-store" });
    const status = await response.json();
    apiStatus.classList.toggle("ready", status.configured);
    apiStatus.classList.toggle("missing", !status.configured);
    apiStatus.lastChild.textContent = status.configured
      ? ` Ready · ${status.model}`
      : " API key not configured";
  } catch {
    apiStatus.classList.add("missing");
    apiStatus.lastChild.textContent = " Local server unavailable";
  }
}

function renderScorecard(data) {
  currentScorecard = data;
  copyStatus.textContent = "";
  overallBadge.textContent = data.overall_status === "pass" ? "Ready to refine" : "Needs attention";
  overallBadge.className = `overall-badge ${data.overall_status}`;
  summary.textContent = data.summary;
  categoryList.replaceChildren();

  const passed = data.categories.filter((category) => category.status === "pass").length;
  const flagged = data.categories.length - passed;
  scoreCount.textContent = `${passed} passed · ${flagged} flagged`;

  data.categories.forEach((category) => {
    const details = document.createElement("details");
    details.className = "category-card";
    details.open = category.status === "flag";

    const heading = document.createElement("summary");
    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = category.category;
    const status = document.createElement("span");
    status.className = `category-status ${category.status}`;
    status.textContent = category.status;
    heading.append(name, status);

    const rationale = document.createElement("p");
    rationale.className = "rationale";
    rationale.textContent = category.rationale;
    details.append(heading, rationale);
    categoryList.append(details);
  });

  resultDisclaimer.textContent = data.disclaimer;
  setView("scorecard");
}

function formatScorecard(data) {
  const lines = [
    "SAR Chasm quality review",
    `Overall: ${data.overall_status.toUpperCase()}`,
    "",
    data.summary,
    "",
  ];
  data.categories.forEach((category) => {
    lines.push(`${category.category}: ${category.status.toUpperCase()}`);
    lines.push(category.rationale, "");
  });
  lines.push(data.disclaimer);
  return lines.join("\n");
}

async function copyReview() {
  if (!currentScorecard) return;
  try {
    await navigator.clipboard.writeText(formatScorecard(currentScorecard));
    copyStatus.textContent = "Review copied.";
  } catch {
    copyStatus.textContent = "Could not copy the review. Your browser may block clipboard access.";
  }
}

function resetReview() {
  narrative.value = "";
  confirmation.checked = false;
  currentScorecard = null;
  copyStatus.textContent = "";
  updateInputState();
  setView("empty");
  narrative.focus();
}

async function analyze() {
  if (analyzeButton.disabled) return;
  setView("loading");
  analyzeButton.disabled = true;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        narrative: narrative.value,
        synthetic_data_confirmed: confirmation.checked,
      }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "The review could not be completed.");
    if (!payload.scorecard || !Array.isArray(payload.scorecard.categories)) {
      throw new Error("The local server returned an incomplete scorecard.");
    }
    renderScorecard(payload.scorecard);
  } catch (error) {
    errorMessage.textContent = error instanceof Error ? error.message : "The review could not be completed.";
    setView("error");
  } finally {
    updateInputState();
  }
}

narrative.addEventListener("input", updateInputState);
confirmation.addEventListener("change", updateInputState);
analyzeButton.addEventListener("click", analyze);
clearButton.addEventListener("click", () => {
  resetReview();
});
exampleButton.addEventListener("click", () => {
  narrative.value = syntheticExample;
  confirmation.checked = true;
  updateInputState();
  narrative.focus();
});
themeToggle.addEventListener("click", toggleTheme);
copyButton.addEventListener("click", copyReview);
reviewAnotherButton.addEventListener("click", resetReview);
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && !analyzeButton.disabled) {
    event.preventDefault();
    analyze();
  }
});
systemTheme.addEventListener("change", (event) => {
  if (!readThemePreference()) applyTheme(event.matches ? "dark" : "light");
});

applyTheme(readThemePreference() || (systemTheme.matches ? "dark" : "light"));
updateInputState();
checkStatus();
