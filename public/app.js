// Constants & State
let simulatedContainers = [];
const CONTAINER_NAMES = [
  'web-nginx-prod', 'db-postgres-main', 'cache-redis-v6',
  'api-node-express', 'worker-queue-email', 'auth-oauth-service',
  'search-elastic-node', 'grafana-metrics-ui', 'prometheus-scrapers'
];

const CHEATSHEET_DATA = {
  'docker-build': {
    title: 'docker build -t <image_name> <path>',
    detail: 'Membangun (build) Docker image dari file instruksi bernama Dockerfile yang berada di direktori tujuan. Flag \'-t\' digunakan untuk memberikan nama/tag ke image hasil build agar mudah diidentifikasi.',
    tip: 'Titik (.) di akhir perintah menunjukkan build context, yang berarti cari file Dockerfile di direktori aktif saat ini.'
  },
  'docker-run': {
    title: 'docker run -d -p <host_port>:<container_port> --name <container_name> <image_name>',
    detail: 'Membuat dan menjalankan instance container baru dari image yang ditentukan. Parameter \'-d\' menjalankan container di mode background (detached). Parameter \'-p\' memetakan port komputer host ke port internal container.',
    tip: 'Contoh: \'-p 3000:3000\' berarti Anda memetakan port 3000 komputer Anda ke port 3000 di dalam container Docker.'
  },
  'docker-ps': {
    title: 'docker ps [options]',
    detail: 'Menampilkan daftar container yang sedang berjalan saat ini. Menambahkan flag \'-a\' akan menampilkan seluruh container, baik yang sedang aktif maupun yang sudah mati/berhenti.',
    tip: 'Gunakan \'docker ps -a\' untuk melihat kontainer lama Anda yang mungkin keluar karena error saat startup.'
  },
  'docker-logs': {
    title: 'docker logs -f <container_id_atau_nama>',
    detail: 'Melihat keluaran console (stdout/stderr) dari aplikasi yang sedang berjalan di dalam container. Flag \'-f\' (follow) membuat log terus terupdate secara real-time saat ada event baru.',
    tip: 'Sangat berguna untuk mencari tahu mengapa aplikasi Anda error atau mengecek koneksi database.'
  },
  'docker-stop': {
    title: 'docker stop <container_id_atau_nama>',
    detail: 'Menghentikan jalannya container secara aman (Graceful Stop) dengan mengirim sinyal SIGTERM, diikuti oleh SIGKILL setelah masa tenggang berlalu.',
    tip: 'Jika container menolak berhenti secara normal, Anda bisa menggunakan perintah \'docker kill\' untuk menghentikannya secara paksa.'
  },
  'docker-compose': {
    title: 'docker compose up -d',
    detail: 'Membaca file konfigurasi \'docker-compose.yml\' lalu secara otomatis membuat network, volume, mengunduh image, dan menjalankan seluruh container yang didefinisikan dalam satu perintah mudah.',
    tip: 'Gunakan \'docker compose down\' untuk menghentikan dan menghapus semua resource (container & network) yang telah dibuat oleh compose.'
  }
};

// DOM Elements
const connStatus = document.getElementById('conn-status');
const statHostname = document.getElementById('stat-hostname');
const statOs = document.getElementById('stat-os');
const statUptime = document.getElementById('stat-uptime');
const statMemory = document.getElementById('stat-memory');
const envTags = document.getElementById('env-tags');

const btnRunSim = document.getElementById('btn-run-sim');
const btnPruneSim = document.getElementById('btn-prune-sim');
const containerCountBadge = document.getElementById('container-count');
const simulatedContainersList = document.getElementById('simulated-containers-list');

const checklistItems = document.querySelectorAll('.check-item input[type="checkbox"]');
const progressPercentage = document.getElementById('progress-percentage');
const progressFill = document.getElementById('progress-fill');

const explanationBox = document.getElementById('explanation-box');
const explanationContent = document.getElementById('explanation-content');
const expTitle = document.getElementById('exp-title');
const expDetail = document.getElementById('exp-detail');
const expTipText = document.getElementById('exp-tip-text');

// Init
document.addEventListener('DOMContentLoaded', () => {
  fetchSystemInfo();
  setInterval(fetchSystemInfo, 3000); // Poll every 3 seconds

  initChecklist();
  initSimulator();
});

// 1. Fetch Real Backend/Container System Info
async function fetchSystemInfo() {
  try {
    const res = await fetch('/api/system-info');
    if (!res.ok) throw new Error('API server returned error');
    const data = await res.json();

    // Reset status indicator
    connStatus.className = 'status-badge';
    connStatus.innerHTML = '<span class="dot pulse"></span> Connected to Server';

    // Update stats
    statHostname.innerText = data.hostname;
    statOs.innerText = `${data.platform} (${data.architecture})`;
    statUptime.innerText = formatUptime(data.uptime);
    statMemory.innerText = `${data.memory.processRss} (Max: ${data.memory.total})`;

    // Populate env tags if empty (only do it once or if changes occur)
    if (envTags.children.length === 0) {
      envTags.innerHTML = '';
      Object.entries(data.envVars).forEach(([key, val]) => {
        const span = document.createElement('span');
        span.className = 'env-tag';
        span.innerText = `${key}=${val}`;
        envTags.appendChild(span);
      });
    }
  } catch (err) {
    connStatus.className = 'status-badge error';
    connStatus.innerHTML = '<span class="dot"></span> Disconnected from Server';
    console.error('Failed to fetch system info:', err);
  }
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}j ${m}m ${s}d`;
}

// 2. Interactive Cheatsheet Explanations
window.showExplanation = function(cmdId) {
  const cmd = CHEATSHEET_DATA[cmdId];
  if (!cmd) return;

  // Toggle layout
  const placeholder = explanationBox.querySelector('.explanation-placeholder');
  if (placeholder) placeholder.remove();
  
  explanationContent.classList.remove('hidden');
  expTitle.innerText = cmd.title;
  expDetail.innerText = cmd.detail;
  expTipText.innerText = cmd.tip;

  // Visual feedback - add a brief flash animation
  explanationBox.style.animation = 'none';
  explanationBox.offsetHeight; // trigger reflow
  explanationBox.style.animation = 'slideIn 0.3s ease-out';
};

// 3. Checklist State Manager
function initChecklist() {
  // Load saved state
  checklistItems.forEach((checkbox, index) => {
    const isChecked = localStorage.getItem(`docker_task_${index}`) === 'true';
    checkbox.checked = isChecked;
    
    checkbox.addEventListener('change', () => {
      localStorage.setItem(`docker_task_${index}`, checkbox.checked);
      updateProgress();
    });
  });

  updateProgress();
}

function updateProgress() {
  const total = checklistItems.length;
  const checked = Array.from(checklistItems).filter(cb => cb.checked).length;
  const percentage = Math.round((checked / total) * 100);

  progressPercentage.innerText = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
}

// 4. Simulated Docker Container Engine
function initSimulator() {
  // Add base simulated containers
  simulatedContainers = [
    { id: '8aef92a832bc', name: 'web-nginx-prod', status: 'running', image: 'nginx:alpine', created: '2 mins ago' },
    { id: 'f3918da9810a', name: 'db-postgres-main', status: 'running', image: 'postgres:15-alpine', created: '5 mins ago' }
  ];

  btnRunSim.addEventListener('click', runNewSimulatedContainer);
  btnPruneSim.addEventListener('click', pruneSimulatedContainers);

  renderSimulatedContainers();
}

function renderSimulatedContainers() {
  if (simulatedContainers.length === 0) {
    simulatedContainersList.innerHTML = `<div class="empty-state">Tidak ada container yang berjalan. Klik 'Run Container Baru' untuk memulai!</div>`;
    containerCountBadge.innerText = '0 Running';
    return;
  }

  const runningCount = simulatedContainers.filter(c => c.status === 'running').length;
  containerCountBadge.innerText = `${runningCount} Running`;

  simulatedContainersList.innerHTML = '';
  simulatedContainers.forEach(container => {
    const isRunning = container.status === 'running';
    const item = document.createElement('div');
    item.className = 'sim-container';
    item.innerHTML = `
      <div class="container-info">
        <div class="container-status-dot ${isRunning ? '' : 'stopped'}"></div>
        <div>
          <span class="container-name">${container.name}</span>
          <span class="container-image">${container.image}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 8px;">ID: ${container.id}</span>
        </div>
      </div>
      <div class="container-actions">
        ${isRunning 
          ? `<button class="btn-icon stop" title="Stop Container" onclick="toggleSimContainer('${container.id}', 'stop')">⏹</button>`
          : `<button class="btn-icon start" title="Start Container" onclick="toggleSimContainer('${container.id}', 'start')">▶</button>`
        }
        <button class="btn-icon remove" title="Remove Container" onclick="removeSimContainer('${container.id}')">🗑</button>
      </div>
    `;
    simulatedContainersList.appendChild(item);
  });
}

function runNewSimulatedContainer() {
  const randomId = Math.random().toString(16).substring(2, 14);
  const randomName = CONTAINER_NAMES[Math.floor(Math.random() * CONTAINER_NAMES.length)] + '-' + Math.floor(Math.random() * 90 + 10);
  
  const images = ['node:18-alpine', 'redis:7.0-alpine', 'nginx:alpine', 'python:3.10-slim'];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  simulatedContainers.unshift({
    id: randomId,
    name: randomName,
    status: 'running',
    image: randomImage,
    created: 'Just now'
  });

  renderSimulatedContainers();
}

window.toggleSimContainer = function(id, action) {
  const container = simulatedContainers.find(c => c.id === id);
  if (container) {
    container.status = action === 'start' ? 'running' : 'stopped';
    renderSimulatedContainers();
  }
};

window.removeSimContainer = function(id) {
  simulatedContainers = simulatedContainers.filter(c => c.id !== id);
  renderSimulatedContainers();
};

function pruneSimulatedContainers() {
  simulatedContainers = simulatedContainers.filter(c => c.status === 'running');
  renderSimulatedContainers();
}
