/**
 * DevOps CI/CD Automation Dashboard - Client Logic & Simulator
 * Orchestrates navigation, interactive workflow diagram, and real-time pipeline simulator.
 */

// Step Details for Workflow Visualizer
const PIPELINE_STEPS = [
  {
    step: 1,
    title: "Stage 1: Developer Workstation",
    desc: "Developer writes code in index.html, style.css, or script.js, executes local tests with 'npm test', stages revisions with 'git add .', and commits using 'git commit -m \"feat: update dashboard\"'."
  },
  {
    step: 2,
    title: "Stage 2: Git Push to GitHub",
    desc: "Developer pushes local commits to the remote repository using 'git push origin main'. The Git client securely negotiates changes with GitHub over SSH or HTTPS."
  },
  {
    step: 3,
    title: "Stage 3: GitHub Repository Webhook",
    desc: "GitHub receives the commit, updates the main branch ref, and fires an internal repository webhook matching the 'on: push: branches: [main]' rule in .github/workflows/deploy.yml."
  },
  {
    step: 4,
    title: "Stage 4: GitHub Actions Runner Allocation",
    desc: "GitHub Actions provisions a clean, isolated virtual machine container (ubuntu-latest) with standard Linux tooling, Git, and Docker ready for containerized execution."
  },
  {
    step: 5,
    title: "Stage 5: Automated Testing & Validation",
    desc: "Runner executes actions/setup-node@v4, installs dependencies, and runs 'npm test'. Validates HTML semantics, responsive CSS tokens, JavaScript syntax, and YAML schema."
  },
  {
    step: 6,
    title: "Stage 6: Artifact Packaging & Security Gate",
    desc: "Upon test pass, actions/upload-pages-artifact packages the workspace into a secure deployment tarball. An ephemeral GitHub OIDC token grants authorized publish permissions."
  },
  {
    step: 7,
    title: "Stage 7: Zero-Downtime Deployment to GitHub Pages",
    desc: "actions/deploy-pages@v4 extracts the artifact to GitHub Pages edge infrastructure. Global CDN caches update within seconds with HTTPS encryption and zero downtime."
  }
];

// Pipeline Simulator Execution Log Sequence
const SIMULATOR_STAGES = [
  {
    progress: 15,
    statusText: "Triggering Webhook: push event detected on refs/heads/main...",
    logType: "log-step",
    message: "[EVENT] Webhook received: Commit 8e4b1c9 pushed to branch 'main' by devops-student"
  },
  {
    progress: 30,
    statusText: "Job 'test' started: Provisioning ubuntu-latest runner...",
    logType: "log-system",
    message: "[RUNNER] Virtual Machine ready: Ubuntu 24.04.1 LTS (x86_64) | Host: GHA-HOST-09"
  },
  {
    progress: 45,
    statusText: "Checking out code and setting up Node.js v20...",
    logType: "log-system",
    message: "[SETUP] actions/checkout@v4 complete (8 files fetched) | actions/setup-node@v4 configured"
  },
  {
    progress: 60,
    statusText: "Running CI Test Suite: 'npm test'...",
    logType: "log-step",
    message: "[TEST] Executing node --test tests/*.test.js..."
  },
  {
    progress: 75,
    statusText: "Running assertions: HTML, CSS, JS, and Workflow YAML...",
    logType: "log-success",
    message: "[TEST-PASS] ✔ 4/4 test suites passed (100% assertions green in 1.42s)"
  },
  {
    progress: 88,
    statusText: "Job 'deploy' started: Packaging Pages artifact with OIDC token...",
    logType: "log-step",
    message: "[BUILD] actions/upload-pages-artifact@v3 created release archive (pages.tar.gz - 42.1 KB)"
  },
  {
    progress: 100,
    statusText: "Deployment Complete! Published to GitHub Pages CDN.",
    logType: "log-success",
    message: "[DEPLOY-SUCCESS] Published to https://student.github.io/devops-cicd-pipeline (HTTP 200 OK)"
  }
];

/**
 * Format timestamp string for simulated terminal output
 * @param {Date} date
 * @returns {string} HH:MM:SS
 */
function formatTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Helper to compute next simulator state
 * @param {number} currentIndex
 * @param {Array} stages
 * @returns {Object|null}
 */
function getSimulatorStage(currentIndex, stages = SIMULATOR_STAGES) {
  if (currentIndex >= 0 && currentIndex < stages.length) {
    return stages[currentIndex];
  }
  return null;
}

// Client-side DOM initialization (runs in browser)
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // 1. Mobile Menu Toggle
    const mobileToggle = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener("click", () => {
        const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";
        mobileToggle.setAttribute("aria-expanded", String(!isExpanded));
        navMenu.classList.toggle("nav-open");
      });

      // Close menu on link click
      navMenu.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          navMenu.classList.remove("nav-open");
          mobileToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    // 2. Interactive Workflow Diagram Node Selection
    const pipeNodes = document.querySelectorAll(".pipe-node");
    const stepTitle = document.getElementById("workflow-step-title");
    const stepDesc = document.getElementById("workflow-step-desc");

    pipeNodes.forEach((node) => {
      node.addEventListener("click", () => {
        pipeNodes.forEach((n) => n.classList.remove("active"));
        node.classList.add("active");

        const stepNum = parseInt(node.getAttribute("data-step"), 10);
        const data = PIPELINE_STEPS.find((s) => s.step === stepNum);
        if (data && stepTitle && stepDesc) {
          stepTitle.textContent = data.title;
          stepDesc.textContent = data.desc;
        }
      });
    });

    // 3. Pipeline Simulator Controller
    const btnStartSim = document.getElementById("btn-start-sim");
    const btnResetSim = document.getElementById("btn-reset-sim");
    const progressBar = document.getElementById("pipeline-progress");
    const progressLabel = document.getElementById("progress-stage-label");
    const consoleOutput = document.getElementById("console-output");
    const consoleClock = document.getElementById("console-clock");

    let isRunning = false;
    let simTimer = null;
    let currentStageIndex = 0;

    function appendLog(message, logType = "log-entry") {
      if (!consoleOutput) return;
      const entry = document.createElement("div");
      entry.className = `log-entry ${logType}`;
      entry.textContent = `[${formatTimestamp()}] ${message}`;
      consoleOutput.appendChild(entry);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function resetSimulator() {
      if (simTimer) clearTimeout(simTimer);
      isRunning = false;
      currentStageIndex = 0;
      if (progressBar) progressBar.style.width = "0%";
      if (progressLabel) progressLabel.textContent = "Status: Ready to trigger pipeline";
      if (btnStartSim) {
        btnStartSim.disabled = false;
        btnStartSim.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg> Trigger Pipeline Run
        `;
      }
      if (consoleOutput) {
        consoleOutput.innerHTML = `<div class="log-entry log-system">[INIT] Simulator reset. Ready for demonstration run.</div>`;
      }
      if (consoleClock) consoleClock.textContent = "Standby";
    }

    function runNextStage() {
      const stage = getSimulatorStage(currentStageIndex);
      if (!stage) {
        isRunning = false;
        if (btnStartSim) {
          btnStartSim.disabled = false;
          btnStartSim.textContent = "Re-Run Pipeline";
        }
        if (progressLabel) {
          progressLabel.textContent = "Pipeline Run Complete: Build Passed & Deployed Successfully!";
        }
        if (consoleClock) consoleClock.textContent = "Completed";
        return;
      }

      // Update UI
      if (progressBar) progressBar.style.width = `${stage.progress}%`;
      if (progressLabel) progressLabel.textContent = stage.statusText;
      if (consoleClock) consoleClock.textContent = `Stage ${currentStageIndex + 1}/7`;
      appendLog(stage.message, stage.logType);

      // Highlight matching node in workflow visualizer
      const matchingNode = document.querySelector(`.pipe-node[data-step="${currentStageIndex + 1}"]`);
      if (matchingNode) {
        pipeNodes.forEach((n) => n.classList.remove("active"));
        matchingNode.classList.add("active");
        const stepData = PIPELINE_STEPS.find((s) => s.step === currentStageIndex + 1);
        if (stepData && stepTitle && stepDesc) {
          stepTitle.textContent = stepData.title;
          stepDesc.textContent = stepData.desc;
        }
      }

      currentStageIndex += 1;
      simTimer = setTimeout(runNextStage, 950);
    }

    if (btnStartSim) {
      btnStartSim.addEventListener("click", () => {
        if (isRunning) return;
        isRunning = true;
        btnStartSim.disabled = true;
        btnStartSim.textContent = "Pipeline Running...";
        currentStageIndex = 0;
        if (consoleOutput) consoleOutput.innerHTML = "";
        appendLog("🚀 GitHub Actions pipeline workflow triggered by developer commit.", "log-step");
        simTimer = setTimeout(runNextStage, 600);
      });
    }

    if (btnResetSim) {
      btnResetSim.addEventListener("click", resetSimulator);
    }
  });
}

// Module export for automated Node.js unit testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PIPELINE_STEPS,
    SIMULATOR_STAGES,
    formatTimestamp,
    getSimulatorStage
  };
}
