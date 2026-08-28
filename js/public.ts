import { Store } from './store';
/* ============================================
   Eco Ethos — Public Page Logic
   Reads data from Store (localStorage)
   Auto-refreshes every 5 seconds
   ============================================ */

const PublicApp = (() => {
  let refreshInterval = null;
  let selectedWardId = null;
  let currentSort = 'points';

  function init() {
    Store.initDefaults();
  
    renderAll();
    setupWardSelector();
    setupNavigation();
    setupSplashScreen();
    setupLeaderboardFilters();

    // Auto-refresh every 5 seconds to pick up admin updates
    refreshInterval = setInterval(renderAll, 2000);

    const connectBtn = document.getElementById('connectHardwareBtn');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => {
        Store.connectUSB();
      });
    }
  }

  function renderAll() {
    renderNotices();
    renderHeroStats();
    renderWardInfo();
    renderSchedules();
    renderNextCollection();
    renderProcessStatus();
    renderIoTStatus();
    renderPodium();
    renderLeaderboard();
    renderImpact();
    updateTimestamp();
  }

  // ── Sidebar & Navigation ────────────────
  
  function setupSplashScreen() {
  const exitBtn = document.getElementById('exitToSplashBtn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      const splash = document.getElementById('splashScreen');
      if (splash) {
        splash.classList.remove('hidden');
        splash.style.opacity = '1';
        splash.style.pointerEvents = 'all';
      }
    });
  }

    const splashScreen = document.getElementById('splashScreen');
    const splashBtn = document.getElementById('splashEnterBtn');
    
    if (splashBtn && splashScreen) {
      splashBtn.addEventListener('click', () => {
        const curtain = document.getElementById('curtain') as any;
        if (curtain) {
          curtain.classList.add('active');
          setTimeout(() => {
            splashScreen.classList.add('hidden');
            setTimeout(() => {
              curtain.classList.remove('active');
            }, 1000);
          }, 800);
        } else {
          splashScreen.classList.add('hidden');
        }
      });
    }
  }

  function setupNavigation() {
    const sidebar = document.getElementById('sidebar') as any;
    const menuToggle = document.getElementById('menuToggle') as any;
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');
    const topbarTitle = document.getElementById('topbarTitle') as any;

    // Mobile Toggle
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target as Node)) {
          sidebar.classList.remove('mobile-open');
        }
      });
    }

    // SPA Tab Logic
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId) as any;
        
        if (targetSection) {
          triggerCurtain(() => {
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
            // Show target section
            targetSection.classList.add('active');
            
            // Update Active Nav Item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update title
            const label = item.querySelector('.nav-label');
            if (label && topbarTitle) {
              topbarTitle.textContent = label.textContent + ' Dashboard';
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'instant' });
          });
        }

        // On mobile, close sidebar after clicking
        if (window.innerWidth <= 1024) {
          sidebar.classList.remove('mobile-open');
        }
      });
    });
  }

  function triggerCurtain(callback: any) { callback(); }

  // ── Leaderboard Filters ───────────────
  function setupLeaderboardFilters() {
    const filters = document.querySelectorAll('.lb-filter-btn');
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSort = (btn as HTMLElement).dataset.sort;
        renderPodium();
        renderLeaderboard();
      });
    });
  }

  // ── Notices ───────────────────────────
  function renderNotices() {
    const container = document.getElementById('noticesContainer') as any;
    const ticker = document.getElementById('tickerContent') as any;
    const tickerWrap = document.getElementById('urgentTicker') as any;
    if (!container) return;

    const notices = Store.getNotices(true); // active only
    if (notices.length === 0) {
      container.innerHTML = '<div class="empty-state">📭 No notices at the moment. Check back soon.</div>';
      if (tickerWrap) (tickerWrap as HTMLElement).style.display = 'none';
      return;
    }

    const icons = { info: 'ℹ️', warning: '⚠️', urgent: '🚨' };
    container.innerHTML = notices.map(n => `
      <div class="notice-card ${n.type}">
        <div class="notice-icon">${icons[n.type] || 'ℹ️'}</div>
        <div class="notice-content">
          <h4>${n.title}</h4>
          <p>${n.message}</p>
          <div class="notice-date">${formatDate(n.date)}</div>
        </div>
      </div>
    `).join('');

    // Update ticker for urgent notices
    const urgent = notices.filter(n => n.type === 'urgent');
    if (urgent.length > 0 && ticker) {
      ticker.textContent = urgent.map(n => `[ ${n.title}: ${n.message} ]`).join(' • ');
      if (tickerWrap) (tickerWrap as HTMLElement).style.display = 'flex';
    } else if (tickerWrap) {
      (tickerWrap as HTMLElement).style.display = 'none';
    }
  }

  // ── Hero Stats ────────────────────────
  function renderHeroStats() {
    const stats = Store.getTotalStats();
    const els = {
      totalWaste: document.getElementById('hWaste'),
      totalCoal: document.getElementById('hCoal'),
      totalCarbon: document.getElementById('hCarbon'),
      totalUsers: document.getElementById('hUsers'),
    };
    if (els.totalWaste) els.totalWaste.textContent = stats.totalWasteCollected.toLocaleString('en-IN');
    if (els.totalCoal) els.totalCoal.textContent = stats.totalWasteConverted.toLocaleString('en-IN');
    if (els.totalCarbon) els.totalCarbon.textContent = stats.totalCarbonSaved.toLocaleString('en-IN');
    if (els.totalUsers) els.totalUsers.textContent = stats.totalUsers.toLocaleString('en-IN');
  }

  // ── Ward Selector ─────────────────────
  function setupWardSelector() {
    const sel = document.getElementById('wardSelector') as any;
    if (!sel) return;

    const wards = Store.getWards();
    sel.innerHTML = wards.map(w => `<option value="${w.id}">Ward ${w.id} — ${w.name} (${w.zone})</option>`).join('');

    selectedWardId = wards.length > 0 ? wards[0].id : null;
    sel.addEventListener('change', () => {
      selectedWardId = parseInt(sel.value);
      renderWardInfo();
      renderSchedules();
      renderNextCollection();
    });
  }

  // ── My Ward Info ──────────────────────
  function renderWardInfo() {
    if (!selectedWardId) return;
    const ward = Store.getWard(selectedWardId);
    if (!ward) return;

    const wiWaste = document.getElementById('wiWaste') as any;
    const wiCoal = document.getElementById('wiCoal') as any;
    const wiCarbon = document.getElementById('wiCarbon') as any;
    const wiPoints = document.getElementById('wiPoints') as any;
    const wiUsers = document.getElementById('wiUsers') as any;
    const wiRank = document.getElementById('wiRank') as any;
    const wiRankBadge = document.getElementById('wiRankBadge') as any;

    if (wiWaste) wiWaste.textContent = `${ward.wasteCollected.toLocaleString('en-IN')} kg`;
    if (wiCoal) wiCoal.textContent = `${ward.wasteConverted.toLocaleString('en-IN')} kg`;
    if (wiCarbon) wiCarbon.textContent = `${ward.carbonSaved.toLocaleString('en-IN')} kg`;
    if (wiPoints) wiPoints.textContent = ward.points.toLocaleString('en-IN');
    if (wiUsers) wiUsers.textContent = ward.activeUsers;

    // Rank
    const lb = Store.getLeaderboard('points');
    const rank = lb.findIndex(w => w.id === selectedWardId) + 1;
    if (wiRank) wiRank.textContent = `#${rank}`;
    if (wiRankBadge) {
      wiRankBadge.textContent = rank <= 3 ? 'Top Performer 🌟' : 'Improving 📈';
      wiRankBadge.className = `rank-change ${rank <= 3 ? 'up' : 'neutral'}`;
    }
  }

  function renderNextCollection() {
    const schedules = Store.getSchedules();
    const mySched = schedules.find(s => s.wardId === selectedWardId);
    if (!mySched) return;

    const ncTime = document.getElementById('ncTime') as any;
    const ncDetail = document.getElementById('ncDetail') as any;
    const ncStatus = document.getElementById('ncStatus') as any;
    const card = document.getElementById('nextCollectionCard') as any;

    if (ncTime) ncTime.textContent = `${mySched.day} • ${mySched.time}`;
    if (ncDetail) ncDetail.textContent = `Collector Unit: ${mySched.collector} | Zone: ${mySched.zone}`;
    
    if (ncStatus) {
      const labels = { 'scheduled': '📅 Scheduled', 'in-progress': '🚛 En Route', 'completed': '✅ Done', 'delayed': '⏰ Delayed' };
      ncStatus.textContent = labels[mySched.status] || mySched.status;
      ncStatus.className = `nc-status ${mySched.status}`;
    }
  }

  // ── Schedules ─────────────────────────
  function renderSchedules() {
    const container = document.getElementById('schedulesContainer') as any;
    if (!container) return;

    const schedules = Store.getSchedules();
    // Show selected ward schedule first, then others
    const sorted = [...schedules].sort((a, b) => {
      if (a.wardId === selectedWardId) return -1;
      if (b.wardId === selectedWardId) return 1;
      return 0;
    });

    container.innerHTML = sorted.slice(0, 6).map(s => {
      const isMyWard = s.wardId === selectedWardId;
      const statusLabels = { 'scheduled': '📅 Scheduled', 'in-progress': '🚛 In Progress', 'completed': '✅ Completed', 'delayed': '⏰ Delayed' };
      return `
        <div class="schedule-card" style="${isMyWard ? 'border-color:var(--border-accent);background:rgba(16,185,129,0.03);' : ''}">
          <div class="schedule-icon">${isMyWard ? '📍' : '🗑️'}</div>
          <div class="schedule-info">
            <h4>${s.wardName} ${isMyWard ? '(Your Ward)' : ''}</h4>
            <p>📅 ${s.day} at ${s.time}</p>
            <span class="collector">🚛 Collector: ${s.collector}</span>
          </div>
          <span class="schedule-status ${s.status}">${statusLabels[s.status] || s.status}</span>
        </div>
      `;
    }).join('');
  }

  // ── Process Status ────────────────────
  function renderProcessStatus() {
    const proc = Store.getProcess();
    const iot = Store.getIoT();
    if (!proc) return;

    const el = {
      label: document.getElementById('procLabel'),
      batch: document.getElementById('procBatchNum'),
      fill: document.getElementById('procFill'),
      pct: document.getElementById('procPct'),
      eta: document.getElementById('procEtaVal'),
      total: document.getElementById('procTotalVal'),
      completed: document.getElementById('procComplVal'),
      sysBadge: document.getElementById('reactorStatusBadge'),
    };

    if (el.label) el.label.textContent = proc.stageLabel || 'Processing...';
    if (el.batch) el.batch.textContent = `Batch #${proc.currentBatch || '—'}`;
    if (el.fill) (el.fill as HTMLElement).style.width = `${proc.progress || 0}%`;
    if (el.pct) el.pct.textContent = `${proc.progress || 0}%`;
    if (el.eta) el.eta.textContent = proc.eta || '—';
    if (el.total) el.total.textContent = proc.totalBatchesToday || '—';
    if (el.completed) el.completed.textContent = proc.completedBatches || '—';

    if (el.sysBadge) {
      const status = iot.reactorStatus || 'running';
      const emojis = { running: '🟢', idle: '🟡', maintenance: '🔴' };
      el.sysBadge.textContent = `${emojis[status] || '⚪'} ${status.charAt(0).toUpperCase() + status.slice(1)}`;
      el.sysBadge.className = `reactor-status ${status}`;
    }

    // Pipeline highlight
    document.querySelectorAll('.stage-step').forEach(step => {
      step.classList.remove('active');
      if ((step as HTMLElement).dataset.stage === proc.stage) step.classList.add('active');
    });
  }

  function renderIoTStatus() {
    const iot = Store.getIoT();
    const els = {
      temp: document.getElementById('pubTemp'),
      smoke: document.getElementById('pubSmoke'),
      air: document.getElementById('pubAir'),
      moist: document.getElementById('pubMoist'),
      weight: document.getElementById('pubWeight'),
      pressure: document.getElementById('pubPressure'),
      heater: document.getElementById('pubHeater'),
      tempStat: document.getElementById('pubTempStatus'),
      smokeStat: document.getElementById('pubSmokeStatus'),
      airStat: document.getElementById('pubAirStatus'),
      moistStat: document.getElementById('pubMoistStatus'),
      weightStat: document.getElementById('pubWeightStatus'),
      pressureStat: document.getElementById('pubPressureStatus'),
      heaterStat: document.getElementById('pubHeaterStatus'),
    };

    if (els.temp) els.temp.textContent = Number(iot.temperature || 0).toFixed(1);
    if (els.smoke) els.smoke.textContent = Number(iot.smoke || 0).toFixed(1);
    if (els.air) els.air.textContent = Number(iot.airQuality || 0).toFixed(1);
    if (els.moist) els.moist.textContent = Number(iot.moisture || 0).toFixed(1);
    if (els.weight) els.weight.textContent = Number(iot.weight || 0).toFixed(1);
    if (els.pressure) els.pressure.textContent = Number(iot.pressure || 0).toFixed(1);
    if (els.heater) els.heater.textContent = iot.relayOn ? "ON" : "OFF";

    // Status logic
    if (els.tempStat) {
      const t = iot.temperature;
      const status = t < 200 ? 'Low' : t > 300 ? 'High' : 'Optimal';
      els.tempStat.textContent = status;
      els.tempStat.className = `irt-status ${status.toLowerCase()}`;
    }
    if (els.smokeStat) {
      const g = iot.smoke;
      const status = g < 30 ? 'Safe' : g < 45 ? 'Warning' : 'Danger';
      els.smokeStat.textContent = status;
      els.smokeStat.className = `irt-status ${status.toLowerCase()}`;
    }
    if (els.airStat) {
      const a = iot.airQuality;
      const status = a < 40 ? 'Good' : a < 70 ? 'Fair' : 'Poor';
      els.airStat.textContent = status;
      els.airStat.className = `irt-status ${status.toLowerCase()}`;
    }
    if (els.moistStat) {
      const m = iot.moisture;
      const status = m < 20 ? 'Optimal' : 'High';
      els.moistStat.textContent = status;
      els.moistStat.className = `irt-status ${status.toLowerCase()}`;
    }
    if (els.weightStat) {
      const w = iot.weight;
      const status = w > 0 ? 'Loaded' : 'Empty';
      els.weightStat.textContent = status;
      els.weightStat.className = `irt-status ${status.toLowerCase()}`;
    }
    if (els.pressureStat) {
      const p = iot.pressure;
      const status = p < 1000 ? 'Normal' : 'High';
      els.pressureStat.textContent = status;
      els.pressureStat.className = `irt-status ${status.toLowerCase()}`;
    }
    if (els.heaterStat) {
      const status = iot.relayOn ? 'Active' : 'Standby';
      els.heaterStat.textContent = status;
      els.heaterStat.className = `irt-status ${status.toLowerCase()}`;
    }

    // Main status bar
    const sysLabel = document.getElementById('sysStatusLabel') as any;
    if (sysLabel) {
      sysLabel.textContent = iot.systemOnline ? '🟢 System Online' : '🔴 System Offline';
      sysLabel.className = `sys-label ${iot.systemOnline ? 'online' : 'offline'}`;
    }
  }

  // ── Leaderboard ───────────────────────
  function renderPodium() {
    const container = document.getElementById('podium') as any;
    if (!container) return;

    const wards = Store.getLeaderboard(currentSort);
    const top3 = wards.slice(0, 3);
    if (top3.length < 3) return;

    // Rearrange for podium: [2, 1, 3]
    const podiumOrder = [top3[1], top3[0], top3[2]];
    const ranks = [2, 1, 3];
    const unitMap = { points: 'pts', wasteCollected: 'kg', carbonSaved: 'kg' };

    container.innerHTML = podiumOrder.map((w, i) => {
      const rank = ranks[i];
      const isMyWard = w.id === selectedWardId;
      const value = w[currentSort].toLocaleString('en-IN');
      const unit = unitMap[currentSort] || '';

      return `
        <div class="podium-rank rank-${rank} ${isMyWard ? 'highlight' : ''}">
          <div class="podium-avatar">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>
          <div class="podium-info">
            <div class="podium-name">${w.name}</div>
            <div class="podium-val">${value} ${unit}</div>
            <div class="podium-label">Ward ${w.id}</div>
          </div>
          <div class="podium-base"><span>${rank}</span></div>
        </div>
      `;
    }).join('');
  }

  function renderLeaderboard() {
    const container = document.getElementById('lbBody') as any;
    if (!container) return;

    const wards = Store.getLeaderboard(currentSort);
    const maxVal = wards.length > 0 ? (wards[0][currentSort] || 1) : 1;
    const unitMap = { points: 'pts', wasteCollected: 'kg', carbonSaved: 'kg' };

    container.innerHTML = wards.map((w, i) => {
      const rank = i + 1;
      const medal = rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : '';
      const barW = ((w[currentSort] / maxVal) * 100).toFixed(1);
      const isMyWard = w.id === selectedWardId;
      const displayVal = w[currentSort].toLocaleString('en-IN');

      return `<tr style="${isMyWard ? 'background:rgba(255, 153, 51, 0.05);' : ''}">
        <td>${medal ? `<span class="lb-medal">${medal}</span>` : `<span class="lb-rank">${rank}</span>`}</td>
        <td><span class="lb-ward">${w.name}</span>${isMyWard ? ' 📍' : ''}<br><span style="font-size:10px;color:var(--text-muted)">Ward ${w.id}</span></td>
        <td><span class="lb-zone ${w.zone.toLowerCase()}">${w.zone}</span></td>
        <td><div class="lb-points-cell"><span class="lb-pts">${displayVal} ${unitMap[currentSort]}</span><div class="lb-bar"><div class="lb-bar-fill" style="width:${barW}%; background:var(--primary)"></div></div></div></td>
        <td class="mono">${w.wasteCollected.toLocaleString('en-IN')} kg</td>
        <td class="mono text-green">${w.carbonSaved.toLocaleString('en-IN')} kg</td>
      </tr>`;
    }).join('');
  }

  // ── Impact ────────────────────────────
  function renderImpact() {
    const stats = Store.getTotalStats();
    const iot = Store.getIoT();
    const el = {
      waste: document.getElementById('impWaste'),
      coal: document.getElementById('impCoal'),
      carbon: document.getElementById('impCarbon'),
    };
    if (el.waste) el.waste.textContent = `${stats.totalWasteCollected.toLocaleString('en-IN')} kg`;
    if (el.coal) el.coal.textContent = `${stats.totalWasteConverted.toLocaleString('en-IN')} kg`;
    if (el.carbon) el.carbon.textContent = `${stats.totalCarbonSaved.toLocaleString('en-IN')} kg`;
  }

  // ── Update Timestamp ──────────────────
  function updateTimestamp() {
    const el = document.getElementById('lastUpdated') as any;
    if (el) el.textContent = `Last synced: ${new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}`;
  }

  // ── Utilities ─────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', PublicApp.init);
