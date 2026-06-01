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
    tip: 'Contoh: \'-p 3000:80\' berarti Anda memetakan port 3000 komputer/VPS Anda ke port default HTTP (80) di dalam container Nginx.'
  },
  'docker-ps': {
    title: 'docker ps [options]',
    detail: 'Menampilkan daftar container yang sedang berjalan saat ini. Menambahkan flag \'-a\' akan menampilkan seluruh container, baik yang sedang aktif maupun yang sudah mati/berhenti.',
    tip: 'Gunakan \'docker ps -a\' untuk melihat kontainer lama Anda yang mungkin keluar karena error saat startup.'
  },
  'docker-logs': {
    title: 'docker logs -f <container_id_atau_nama>',
    detail: 'Melihat keluaran console (stdout/stderr) dari server web Nginx di dalam container secara real-time.',
    tip: 'Sangat berguna untuk melacak request HTTP masuk dan melihat apakah ada file statis yang gagal dimuat (error 404).'
  },
  'docker-stop': {
    title: 'docker stop <container_id_atau_nama>',
    detail: 'Menghentikan jalannya container secara aman (Graceful Stop).',
    tip: 'Jika container Nginx dihentikan, situs web dashboard tidak akan bisa diakses sampai Anda menjalankannya kembali.'
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

// Timer state
let startTime = Date.now();

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderStaticDiagnostics();
  setInterval(updateUptimeClock, 1000); // Update uptime every second

  initChecklist();
  initSimulator();
});

// 1. Static Diagnostics Renderer (Simulated Container Info)
function renderStaticDiagnostics() {
  const currentHost = window.location.hostname || 'localhost';
  statHostname.innerText = currentHost;

  let userPlatform = 'Linux (alpine)';
  if (navigator.userAgent.indexOf('Win') !== -1) userPlatform = 'Windows (Docker Desktop)';
  if (navigator.userAgent.indexOf('Mac') !== -1) userPlatform = 'macOS (Docker Desktop)';
  if (navigator.userAgent.indexOf('Linux') !== -1 && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    userPlatform = 'Linux VPS (Docker Engine)';
  }
  statOs.innerText = userPlatform;
  statMemory.innerText = '1.45 MB / 16.0 MB';
}

function updateUptimeClock() {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  statUptime.innerText = formatUptime(elapsedSeconds);
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

  const placeholder = explanationBox.querySelector('.explanation-placeholder');
  if (placeholder) placeholder.remove();
  
  explanationContent.classList.remove('hidden');
  expTitle.innerText = cmd.title;
  expDetail.innerText = cmd.detail;
  expTipText.innerText = cmd.tip;

  explanationBox.style.animation = 'none';
  explanationBox.offsetHeight;
  explanationBox.style.animation = 'slideIn 0.3s ease-out';
};

// 3. Checklist State Manager
function initChecklist() {
  checklistItems.forEach((checkbox, index) => {
    const isChecked = localStorage.getItem(`docker_static_task_${index}`) === 'true';
    checkbox.checked = isChecked;
    
    checkbox.addEventListener('change', () => {
      localStorage.setItem(`docker_static_task_${index}`, checkbox.checked);
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
