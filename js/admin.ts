import { Store } from './store';
/* ============================================
   Eco Ethos — Admin Panel Logic
   ============================================ */

const Admin = (() => {
  let currentSection = 'overview';

  function init() {
    Store.initDefaults();
  
    setupNavigation();
    setupMobileMenu();
    loadSection('overview');
  }

  // ── Navigation ────────────────────────
  function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        const section = (link as HTMLElement).dataset.section;
        if (section && section !== currentSection) {
          triggerCurtain(() => loadSection(section));
        }
      });
    });
  }

  function triggerCurtain(callback: any) { callback(); }

  function setupMobileMenu() {
    const btn = document.getElementById('menuBtn') as any;
    const sidebar = document.getElementById('adminSidebar') as any;
    const overlay = document.getElementById('sidebarOverlay') as any;
    if (btn) btn.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('active'); });
    if (overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });
  }

  function loadSection(section) {
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-link[data-section="${section}"]`);
    if (activeNav) activeNav.classList.add('active');

    document.querySelectorAll('.admin-section').forEach(s => { s.classList.remove('active'); void (s as HTMLElement).offsetWidth; });
    const sec = document.getElementById(`sec-${section}`) as any;
    if (sec) sec.classList.add('active');

    const titles = {
      'overview': { t: 'Overview', s: 'System-wide summary & quick actions' },
      'ward-data': { t: 'Ward Data', s: 'Update ward-wise collection & conversion data' },
      'schedules': { t: 'Collection Schedule', s: 'Manage garbage collection schedules per ward' },
      'notices': { t: 'Government Notices', s: 'Post and manage public notices' },
      'iot': { t: 'IoT Controls', s: 'Manage sensor readings & system status' },
      'process': { t: 'Process Control', s: 'Control batch processing status' },
    };
    const ti = titles[section];
    if (ti) { document.getElementById('secTitle').textContent = ti.t; document.getElementById('secSubtitle').textContent = ti.s; }

    currentSection = section;
    document.getElementById('adminSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');

    switch (section) {
      case 'overview': renderOverview(); break;
      case 'ward-data': renderWardData(); break;
      case 'schedules': renderSchedules(); break;
      case 'notices': renderNotices(); break;
      case 'iot': renderIoT(); break;
      case 'process': renderProcess(); break;
    }
  }

  // ── Toast ─────────────────────────────
  function toast(msg, type = 'success') {
    const container = document.getElementById('toastContainer') as any;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${msg}`;
    container.appendChild(t);
    setTimeout(() => { (t as HTMLElement).style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  // ══════════════════════════════════════
  //  OVERVIEW
  // ══════════════════════════════════════
  function renderOverview() {
    const stats = Store.getTotalStats();
    const iot = Store.getIoT();
    const process = Store.getProcess();

    document.getElementById('overviewStats').innerHTML = `
      <div class="mini-stat"><div class="stat-icon">🗑️</div><div class="stat-val">${stats.totalWasteCollected.toLocaleString('en-IN')}<span class="stat-unit">kg</span></div><div class="stat-lbl">Total Waste Collected</div></div>
      <div class="mini-stat"><div class="stat-icon">⚡</div><div class="stat-val">${stats.totalWasteConverted.toLocaleString('en-IN')}<span class="stat-unit">kg</span></div><div class="stat-lbl">Green Coal Produced</div></div>
      <div class="mini-stat"><div class="stat-icon">🌍</div><div class="stat-val">${stats.totalCarbonSaved.toLocaleString('en-IN')}<span class="stat-unit">kg</span></div><div class="stat-lbl">CO₂ Offset</div></div>
      <div class="mini-stat"><div class="stat-icon">👥</div><div class="stat-val">${stats.totalUsers.toLocaleString('en-IN')}</div><div class="stat-lbl">Active Participants</div></div>
      <div class="mini-stat">
        <div class="stat-icon">${iot.systemOnline ? '🟢' : '🔴'}</div>
        <div class="stat-val">${iot.systemOnline ? 'Online' : 'Offline'}</div>
        <div class="stat-lbl">System</div>
        <div class="reactor-status ${iot.reactorStatus || 'running'}" style="margin-top:8px; font-size:9px;">
          ${(iot.reactorStatus || 'running').toUpperCase()}
        </div>
      </div>
    `;

    // Quick actions
    document.getElementById('quickActions').innerHTML = `
      <div class="quick-card" onclick="Admin.go('ward-data')"><div class="q-icon">📝</div><div class="q-title">Update Ward Data</div><div class="q-desc">Enter latest collection stats</div></div>
      <div class="quick-card" onclick="Admin.go('notices')"><div class="q-icon">📢</div><div class="q-title">Post Notice</div><div class="q-desc">Create government notice</div></div>
      <div class="quick-card" onclick="Admin.go('schedules')"><div class="q-icon">🗓️</div><div class="q-title">Edit Schedule</div><div class="q-desc">Update collection times</div></div>
      <div class="quick-card" onclick="Admin.go('iot')"><div class="q-icon">📡</div><div class="q-title">IoT Controls</div><div class="q-desc">Adjust sensor readings</div></div>
      <div class="quick-card" onclick="Admin.go('process')"><div class="q-icon">🏭</div><div class="q-title">Process Control</div><div class="q-desc">Manage batch status</div></div>
    `;

    // IoT Snapshot
    const iotSnapshot = document.getElementById('iotSnapshot');
    if (iotSnapshot) {
      iotSnapshot.innerHTML = `
        <div class="card" style="height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div><div style="font-size:12px; color:var(--text-muted)">🌡️ Temp</div><div style="font-size:18px; font-weight:800; color:var(--text-main)">${Number(iot.temperature || 0).toFixed(1)} °C</div></div>
            <div><div style="font-size:12px; color:var(--text-muted)">💨 Smoke</div><div style="font-size:18px; font-weight:800; color:var(--text-main)">${Number(iot.smoke || 0).toFixed(1)} %</div></div>
            <div><div style="font-size:12px; color:var(--text-muted)">🌿 Air Quality</div><div style="font-size:18px; font-weight:800; color:var(--text-main)">${Number(iot.airQuality || 0).toFixed(1)} AQI</div></div>
            <div><div style="font-size:12px; color:var(--text-muted)">💧 Moisture</div><div style="font-size:18px; font-weight:800; color:var(--text-main)">${Number(iot.moisture || 0).toFixed(1)} %</div></div>
            <div><div style="font-size:12px; color:var(--text-muted)">⚖️ Weight</div><div style="font-size:18px; font-weight:800; color:var(--text-main)">${Number(iot.weight || 0).toFixed(1)} kg</div></div>
            <div><div style="font-size:12px; color:var(--text-muted)">🔥 Heater</div><div style="font-size:18px; font-weight:800; color:var(--accent)">${iot.relayOn ? 'ON' : 'OFF'}</div></div>
          </div>
          <button class="btn btn-ghost" style="width: 100%;" onclick="Admin.go('iot')">View Full Diagnostics</button>
        </div>
      `;
    }


    // Ward summary table
    const wards = Store.getLeaderboard('points');
    document.getElementById('overviewTable').innerHTML = `
      <table class="data-table">
        <thead><tr><th>Rank</th><th>Ward</th><th>Zone</th><th>Waste (kg)</th><th>Coal (kg)</th><th>CO₂ Saved</th><th>Points</th><th>Last Updated</th></tr></thead>
        <tbody>${wards.map((w, i) => {
          const rank = i + 1;
          const medal = rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank;
          const ago = timeAgo(w.lastUpdated);
          return `<tr>
            <td>${rank <= 3 ? `<span style="font-size:16px">${medal}</span>` : `<span class="mono">${rank}</span>`}</td>
            <td><strong>${w.name}</strong><br><span style="font-size:11px;color:var(--text-muted)">Ward ${w.id}</span></td>
            <td><span class="zone zone-${w.zone.toLowerCase()}">${w.zone}</span></td>
            <td class="mono">${w.wasteCollected.toLocaleString('en-IN')}</td>
            <td class="mono text-green">${w.wasteConverted.toLocaleString('en-IN')}</td>
            <td class="mono text-green">${w.carbonSaved.toLocaleString('en-IN')}</td>
            <td class="mono text-amber">${w.points.toLocaleString('en-IN')}</td>
            <td style="font-size:11px;color:var(--text-muted)">${ago}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    `;
  }

  // ══════════════════════════════════════
  //  WARD DATA
  // ══════════════════════════════════════
  function renderWardData() {
    const wards = Store.getWards();
    const wardSelect = document.getElementById('wardSelect') as any;

    // Populate ward dropdown
    wardSelect.innerHTML = `<option value="">— Select Ward —</option>` +
      wards.map(w => `<option value="${w.id}">Ward ${w.id} — ${w.name} (${w.zone})</option>`).join('');

    wardSelect.onchange = () => {
      const wid = parseInt(wardSelect.value);
      if (!wid) { document.getElementById('wardForm').style.display = 'none'; return; }
      const ward = Store.getWard(wid);
      document.getElementById('wardForm').style.display = 'block';
      document.getElementById('wdHeader').innerHTML = `<h4>Editing: ${ward.name}</h4><span class="badge zone-${ward.zone.toLowerCase()}">${ward.zone} Zone</span>`;
      (document.getElementById('wdWaste') as HTMLInputElement).value = ward.wasteCollected;
      (document.getElementById('wdCoal') as HTMLInputElement).value = ward.wasteConverted;
      (document.getElementById('wdCarbon') as HTMLInputElement).value = ward.carbonSaved;
      (document.getElementById('wdPoints') as HTMLInputElement).value = ward.points;
      (document.getElementById('wdUsers') as HTMLInputElement).value = ward.activeUsers;
    };

    // Save handler
    document.getElementById('wardSaveBtn').onclick = () => {
      const wid = parseInt(wardSelect.value);
      if (!wid) return toast('Select a ward first', 'error');
      Store.updateWard(wid, {
        wasteCollected: parseFloat((document.getElementById('wdWaste') as HTMLInputElement).value) || 0,
        wasteConverted: parseFloat((document.getElementById('wdCoal') as HTMLInputElement).value) || 0,
        carbonSaved: parseFloat((document.getElementById('wdCarbon') as HTMLInputElement).value) || 0,
        points: parseInt((document.getElementById('wdPoints') as HTMLInputElement).value) || 0,
        activeUsers: parseInt((document.getElementById('wdUsers') as HTMLInputElement).value) || 0,
      });
      toast(`Ward data updated for Ward ${wid}`);
      renderWardDataTable();
    };

    renderWardDataTable();
  }

  function renderWardDataTable() {
    const wards = Store.getWards();
    document.getElementById('wardDataTable').innerHTML = `
      <table class="data-table">
        <thead><tr><th>Ward</th><th>Zone</th><th>Waste Collected</th><th>Green Coal</th><th>CO₂ Saved</th><th>Points</th><th>Users</th><th>Actions</th></tr></thead>
        <tbody>${wards.map(w => `<tr>
          <td><strong>${w.name}</strong></td>
          <td><span class="zone zone-${w.zone.toLowerCase()}">${w.zone}</span></td>
          <td class="mono">${w.wasteCollected.toLocaleString('en-IN')} kg</td>
          <td class="mono text-green">${w.wasteConverted.toLocaleString('en-IN')} kg</td>
          <td class="mono text-green">${w.carbonSaved.toLocaleString('en-IN')} kg</td>
          <td class="mono text-amber">${w.points.toLocaleString('en-IN')}</td>
          <td class="mono">${w.activeUsers}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="Admin.editWard(${w.id})">✏️ Edit</button></td>
        </tr>`).join('')}</tbody>
      </table>
    `;
  }

  function editWard(wardId) {
    (document.getElementById('wardSelect') as HTMLInputElement).value = wardId;
    document.getElementById('wardSelect').dispatchEvent(new Event('change'));
    document.getElementById('wardForm').scrollIntoView({ behavior: 'smooth' });
  }

  // ══════════════════════════════════════
  //  SCHEDULES
  // ══════════════════════════════════════
  function renderSchedules() {
    const schedules = Store.getSchedules();
    const container = document.getElementById('schedulesBody') as any;

    container.innerHTML = schedules.map(s => `<tr>
      <td><strong>${s.wardName}</strong></td>
      <td><span class="zone zone-${s.zone.toLowerCase()}">${s.zone}</span></td>
      <td>
        <select class="sched-day" data-ward="${s.wardId}" style="padding:6px 10px;background:var(--bg-alt);border:1px solid var(--border);border-radius:6px;color:var(--text-main);font-size:12px;font-family:'Inter',sans-serif;">
          ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => `<option value="${d}" ${d===s.day?'selected':''}>${d}</option>`).join('')}
        </select>
      </td>
      <td><input type="time" class="sched-time" data-ward="${s.wardId}" value="${s.time}" style="padding:6px 10px;background:var(--bg-alt);border:1px solid var(--border);border-radius:6px;color:var(--text-main);font-size:12px;font-family:'Inter',sans-serif;"></td>
      <td>
        <select class="sched-status" data-ward="${s.wardId}" style="padding:6px 10px;background:var(--bg-alt);border:1px solid var(--border);border-radius:6px;color:var(--text-main);font-size:12px;font-family:'Inter',sans-serif;">
          ${['scheduled','in-progress','completed','delayed'].map(st => `<option value="${st}" ${st===s.status?'selected':''}>${st.replace('-',' ')}</option>`).join('')}
        </select>
      </td>
      <td>
        <input type="text" class="sched-unit" data-ward="${s.wardId}" value="${s.collector}" style="padding:6px 10px;background:var(--bg-alt);border:1px solid var(--border);border-radius:6px;color:var(--text-main);font-size:12px;font-family:'Inter',sans-serif;width:80px;">
      </td>
      <td><button class="btn btn-primary btn-sm" onclick="Admin.saveSchedule(${s.wardId})">💾 Save</button></td>
    </tr>`).join('');
  }

  function saveSchedule(wardId) {
    const day = (document.querySelector(`.sched-day[data-ward="${wardId}"]`) as HTMLInputElement).value;
    const time = (document.querySelector(`.sched-time[data-ward="${wardId}"]`) as HTMLInputElement).value;
    const status = (document.querySelector(`.sched-status[data-ward="${wardId}"]`) as HTMLInputElement).value;
    const collector = (document.querySelector(`.sched-unit[data-ward="${wardId}"]`) as HTMLInputElement).value;
    Store.updateSchedule(wardId, { day, time, status, collector });
    toast(`Schedule updated for Ward ${wardId}`);
  }

  // ══════════════════════════════════════
  //  NOTICES
  // ══════════════════════════════════════
  let selectedNoticeType = 'info';

  function renderNotices() {
    const titleInput = document.getElementById('noticeTitle') as any;
    const messageInput = document.getElementById('noticeMessage') as any;
    const previewArea = document.getElementById('noticePreview') as any;

    // Type selector
    document.querySelectorAll('.notice-type-btn').forEach(btn => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.type === selectedNoticeType);
      (btn as HTMLElement).onclick = () => {
        selectedNoticeType = (btn as HTMLElement).dataset.type;
        document.querySelectorAll('.notice-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if ((previewArea as HTMLElement).style.display === 'block') updateNoticePreview();
      };
    });

    // Preview handler
    function updateNoticePreview() {
      const title = titleInput.value.trim() || 'Notice Title';
      const message = messageInput.value.trim() || 'Notice message will appear here...';
      const icons = { info: 'ℹ️', warning: '⚠️', urgent: '🚨' };
      
      previewArea.innerHTML = `
        <div class="notice-card ${selectedNoticeType}" style="border:1px solid var(--border); padding:16px; border-radius:8px; border-left:6px solid ${selectedNoticeType === 'info' ? 'var(--accent)' : selectedNoticeType === 'warning' ? 'var(--primary)' : '#E74C3C'}">
          <div style="display:flex; gap:12px;">
            <div style="font-size:20px;">${icons[selectedNoticeType]}</div>
            <div>
              <h4 style="margin:0; font-size:16px;">${title}</h4>
              <p style="margin:4px 0 0; font-size:13px; color:var(--text-muted);">${message}</p>
            </div>
          </div>
        </div>
      `;
      (previewArea as HTMLElement).style.display = 'block';
    }

    document.getElementById('previewNoticeBtn').onclick = updateNoticePreview;

    // Post handler
    document.getElementById('postNoticeBtn').onclick = () => {
      const title = titleInput.value.trim();
      const message = messageInput.value.trim();
      if (!title || !message) return toast('Fill in both title and message', 'error');
      
      Store.addNotice({ type: selectedNoticeType, title, message });
      titleInput.value = '';
      messageInput.value = '';
      (previewArea as HTMLElement).style.display = 'none';
      toast('Notice posted successfully!');
      renderNoticesList();
    };

    renderNoticesList();
  }

  function renderNoticesList() {
    const notices = Store.getNotices();
    const container = document.getElementById('noticesList') as any;

    if (notices.length === 0) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted)">No notices yet</div>';
      return;
    }

    container.innerHTML = notices.map(n => `
      <div class="notice-item ${n.active ? '' : 'notice-inactive'}">
        <div class="notice-dot ${n.type}"></div>
        <div class="notice-body">
          <h5>${n.title}</h5>
          <p>${n.message}</p>
          <div class="notice-meta">
            <span class="notice-date">${new Date(n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span class="badge badge-${n.type === 'info' ? 'cyan' : n.type === 'warning' ? 'amber' : 'rose'}">${n.type}</span>
            <span class="badge ${n.active ? 'badge-green' : 'badge-rose'}">${n.active ? 'active' : 'hidden'}</span>
          </div>
        </div>
        <div class="notice-actions">
          <button class="notice-toggle" onclick="Admin.toggleNotice('${n.id}')" title="${n.active ? 'Hide' : 'Show'}">${n.active ? '👁️' : '👁️‍🗨️'}</button>
          <button class="notice-delete" onclick="Admin.deleteNotice('${n.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  function toggleNotice(id) { Store.toggleNotice(id); renderNoticesList(); toast('Notice visibility toggled'); }
  function deleteNotice(id) { Store.removeNotice(id); renderNoticesList(); toast('Notice deleted'); }

  // ══════════════════════════════════════
  //  IoT CONTROLS
  // ══════════════════════════════════════
  function renderIoT() {
    const iot = Store.getIoT();

    // Set slider values
    const tempSlider = document.getElementById('iotTemp') as any;
    const gasSlider = document.getElementById('iotGas') as any;
    const moistSlider = document.getElementById('iotMoist') as any;
    const effSlider = document.getElementById('iotEff') as any;

    if (tempSlider) { tempSlider.value = iot.temperature; document.getElementById('iotTempVal').textContent = iot.temperature; }
    if (gasSlider) { gasSlider.value = iot.smoke; document.getElementById('iotGasVal').textContent = iot.smoke; }
    if (moistSlider) { moistSlider.value = iot.moisture; document.getElementById('iotMoistVal').textContent = iot.moisture; }
    if (effSlider) { effSlider.value = iot.airQuality; document.getElementById('iotEffVal').textContent = iot.airQuality; }

    // Live slider updates
    ['iotTemp', 'iotGas', 'iotMoist', 'iotEff'].forEach(id => {
      const el = document.getElementById(id) as any;
      if (el) (el as HTMLElement).oninput = () => { document.getElementById(id + 'Val').textContent = parseFloat(el.value).toFixed(1); };
    });

    // System toggle
    const sysToggle = document.getElementById('sysOnlineToggle') as any;
    if (sysToggle) sysToggle.checked = iot.systemOnline;

    // Reactor status
    const reactorSel = document.getElementById('reactorStatus') as any;
    if (reactorSel) reactorSel.value = iot.reactorStatus || 'running';

    // Save
    document.getElementById('iotSaveBtn').onclick = () => {
      Store.updateIoT({
        ...iot,
        temperature: parseFloat((document.getElementById('iotTemp') as HTMLInputElement).value),
        smoke: parseFloat((document.getElementById('iotGas') as HTMLInputElement).value),
        moisture: parseFloat((document.getElementById('iotMoist') as HTMLInputElement).value),
        airQuality: parseFloat((document.getElementById('iotEff') as HTMLInputElement).value),
        systemOnline: (document.getElementById('sysOnlineToggle') as HTMLInputElement).checked,
        reactorStatus: (document.getElementById('reactorStatus') as HTMLInputElement).value,
      });
      toast('IoT sensor data updated — changes will reflect on public page');
    };

    // Randomize
    document.getElementById('iotRandomBtn').onclick = () => {
      const vals = {
        temperature: Store.randF(220, 280),
        smoke: Store.randF(5, 30),
        moisture: Store.randF(8, 25),
        airQuality: Store.randF(65, 95),
      };
      (document.getElementById('iotTemp') as HTMLInputElement).value = vals.temperature.toString(); document.getElementById('iotTempVal').textContent = vals.temperature.toString();
      (document.getElementById('iotGas') as HTMLInputElement).value = vals.smoke.toString(); document.getElementById('iotGasVal').textContent = vals.smoke.toString();
      (document.getElementById('iotMoist') as HTMLInputElement).value = vals.moisture.toString(); document.getElementById('iotMoistVal').textContent = vals.moisture.toString();
      (document.getElementById('iotEff') as HTMLInputElement).value = vals.airQuality.toString(); document.getElementById('iotEffVal').textContent = vals.airQuality.toString();
      toast('Random values generated — click Save to apply', 'info');
    };
  }

  // ══════════════════════════════════════
  //  PROCESS CONTROL
  // ══════════════════════════════════════
  function renderProcess() {
    const proc = Store.getProcess();
    (document.getElementById('procBatch') as HTMLInputElement).value = proc.currentBatch || '';
    (document.getElementById('procStage') as HTMLInputElement).value = proc.stage || 'torrefaction';
    (document.getElementById('procProgress') as HTMLInputElement).value = proc.progress || 50;
    document.getElementById('procProgressVal').textContent = `${proc.progress || 50}%`;
    (document.getElementById('procEta') as HTMLInputElement).value = proc.eta || '';
    (document.getElementById('procTotalBatches') as HTMLInputElement).value = proc.totalBatchesToday || '';
    (document.getElementById('procCompletedBatches') as HTMLInputElement).value = proc.completedBatches || '';

    document.getElementById('procProgress').oninput = (e) => {
      document.getElementById('procProgressVal').textContent = `${(e.target as HTMLInputElement).value}%`;
    };

    document.getElementById('procSaveBtn').onclick = () => {
      const stageLabels = {
        'collection': 'Waste Collection in Progress',
        'preprocessing': 'Pre-processing (Drying & Shredding)',
        'torrefaction': 'Torrefaction in Progress',
        'cooling': 'Cooling & Quality Check',
        'briquetting': 'Briquette Formation',
        'completed': 'Batch Completed',
      };
      const stage = (document.getElementById('procStage') as HTMLInputElement).value;
      Store.updateProcess({
        currentBatch: parseInt((document.getElementById('procBatch') as HTMLInputElement).value) || 0,
        stage,
        stageLabel: stageLabels[stage] || stage,
        progress: parseInt((document.getElementById('procProgress') as HTMLInputElement).value) || 0,
        eta: (document.getElementById('procEta') as HTMLInputElement).value,
        totalBatchesToday: parseInt((document.getElementById('procTotalBatches') as HTMLInputElement).value) || 0,
        completedBatches: parseInt((document.getElementById('procCompletedBatches') as HTMLInputElement).value) || 0,
      });
      toast('Process status updated — visible on public page');
    };
  }

  // ── Utilities ─────────────────────────
  function timeAgo(dateStr) {
    if (!dateStr) return 'N/A';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function go(section) { loadSection(section); }

  // ── Public API ────────────────────────
  return {
    init, go, editWard,
    saveSchedule,
    toggleNotice, deleteNotice,
  };
})();

(window as any).Admin = Admin;
document.addEventListener('DOMContentLoaded', Admin.init);
