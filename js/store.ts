/* ============================================
   Eco Ethos — Shared Data Store (localStorage)
   Bridges Admin Panel ↔ Public Page
   ============================================ */

export const Store = (() => {
  const PREFIX = 'ecoethos_';

  // ── Ward Definitions ──────────────────
  const WARD_DEFS = [
    { id: 1,  name: "Shanti Nagar",       zone: "North" },
    { id: 2,  name: "Gandhi Chowk",       zone: "North" },
    { id: 3,  name: "Nehru Colony",        zone: "East" },
    { id: 4,  name: "Rajiv Garden",        zone: "East" },
    { id: 5,  name: "Ambedkar Nagar",      zone: "South" },
    { id: 6,  name: "Tagore Park",         zone: "South" },
    { id: 7,  name: "Subhash Ward",        zone: "West" },
    { id: 8,  name: "Patel Colony",        zone: "West" },
    { id: 9,  name: "Bose Nagar",          zone: "Central" },
    { id: 10, name: "Vivekananda Ward",    zone: "Central" },
    { id: 11, name: "Sardar Enclave",      zone: "North" },
    { id: 12, name: "Indira Nagar",        zone: "East" },
    { id: 13, name: "Lakshmi Bai Colony",  zone: "South" },
    { id: 14, name: "Azad Ward",           zone: "West" },
    { id: 15, name: "Bhagat Singh Nagar",  zone: "Central" },
  ];

  // ── Helpers ───────────────────────────
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randF(min, max) { return parseFloat((Math.random() * (max - min) + min).toFixed(1)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function get(key) {
    try { const v = localStorage.getItem(PREFIX + key); return v ? JSON.parse(v) : null; }
    catch { return null; }
  }
  function set(key, val) { localStorage.setItem(PREFIX + key, JSON.stringify(val)); }
  function remove(key) { localStorage.removeItem(PREFIX + key); }

  // ── Initialize Defaults ───────────────
  function initDefaults(force = false) {
    if (!force && get('initialized')) return;

    // Ward Data
    const wards = WARD_DEFS.map(w => ({
      ...w,
      wasteCollected: rand(400, 2200),
      wasteConverted: rand(150, 900),
      carbonSaved: rand(250, 1400),
      points: rand(1500, 9000),
      activeUsers: rand(15, 45),
      lastUpdated: new Date().toISOString(),
    }));
    set('wards', wards);

    // Collection Schedules
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const times = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00'];
    const units = ['Unit A', 'Unit B', 'Unit C', 'Unit D', 'Unit E'];
    const schedules = WARD_DEFS.map((w, i) => ({
      wardId: w.id,
      wardName: w.name,
      zone: w.zone,
      day: days[i % 7],
      time: times[i % 7],
      status: ['scheduled', 'scheduled', 'in-progress', 'completed'][rand(0, 3)],
      collector: units[i % 5],
      nextCollection: getNextDate(days[i % 7], times[i % 7]),
    }));
    set('schedules', schedules);

    // Government Notices
    set('notices', [
      {
        id: uid(), type: 'info',
        title: 'Ward 3 & 12: Schedule Change',
        message: 'Garbage collection for Nehru Colony and Indira Nagar has been shifted to 9:00 AM starting next week due to road maintenance work.',
        date: new Date().toISOString(), active: true,
      },
      {
        id: uid(), type: 'urgent',
        title: 'Plastic Waste Drive – 28 April',
        message: 'Special plastic waste collection drive across all wards on 28th April. Please keep plastic waste segregated separately. Extra eco-points will be awarded for participation!',
        date: new Date(Date.now() - 86400000).toISOString(), active: true,
      },
      {
        id: uid(), type: 'warning',
        title: 'Monsoon Preparedness',
        message: 'With monsoon approaching, please ensure waste bins are covered. Wet waste must be drained before disposal to ensure torrefaction efficiency.',
        date: new Date(Date.now() - 172800000).toISOString(), active: true,
      },
    ]);

    // IoT Sensor Data (Initialize Offline until ESP32 connects)
    set('iot', {
      temperature: 0,
      smoke: 0,
      airQuality: 0,
      moisture: 0,
      weight: 0,
      pressure: 0,
      relayOn: false,
      systemOnline: false,
      reactorStatus: 'offline',
      lastUpdated: new Date().toISOString(),
    });

    // Process Status
    set('process', {
      currentBatch: rand(840, 870),
      stage: 'torrefaction',
      stageLabel: 'Torrefaction in Progress',
      progress: rand(40, 80),
      startTime: new Date(Date.now() - rand(1800000, 5400000)).toISOString(),
      eta: `${rand(20, 50)} mins`,
      totalBatchesToday: rand(8, 15),
      completedBatches: rand(5, 10),
    });

    set('initialized', true);
  }

  function getNextDate(dayName, time) {
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const now = new Date();
    const target = dayMap[dayName];
    let diff = target - now.getDay();
    if (diff <= 0) diff += 7;
    const next = new Date(now);
    next.setDate(now.getDate() + diff);
    const [h, m] = time.split(':');
    next.setHours(parseInt(h), parseInt(m), 0, 0);
    return next.toISOString();
  }

  // ── Ward Operations ───────────────────
  function getWards() { return get('wards') || []; }

  function updateWard(wardId, data) {
    const wards = getWards();
    const idx = wards.findIndex(w => w.id === wardId);
    if (idx === -1) return false;
    wards[idx] = { ...wards[idx], ...data, lastUpdated: new Date().toISOString() };
    set('wards', wards);
    return true;
  }

  function getWard(wardId) {
    return getWards().find(w => w.id === wardId) || null;
  }

  // ── Schedule Operations ───────────────
  function getSchedules() { return get('schedules') || []; }

  function updateSchedule(wardId, data) {
    const schedules = getSchedules();
    const idx = schedules.findIndex(s => s.wardId === wardId);
    if (idx === -1) return false;
    if (data.day && data.time) {
      data.nextCollection = getNextDate(data.day, data.time);
    }
    schedules[idx] = { ...schedules[idx], ...data };
    set('schedules', schedules);
    return true;
  }

  // ── Notice Operations ─────────────────
  function getNotices(activeOnly = false) {
    const all = get('notices') || [];
    return activeOnly ? all.filter(n => n.active) : all;
  }

  function addNotice(notice) {
    const notices = getNotices();
    notices.unshift({
      id: uid(),
      ...notice,
      date: new Date().toISOString(),
      active: true,
    });
    set('notices', notices);
  }

  function removeNotice(noticeId) {
    const notices = getNotices().filter(n => n.id !== noticeId);
    set('notices', notices);
  }

  function toggleNotice(noticeId) {
    const notices = getNotices();
    const n = notices.find(n => n.id === noticeId);
    if (n) n.active = !n.active;
    set('notices', notices);
  }

  // ── IoT Operations ────────────────────
  function getIoT() { return get('iot') || {}; }

  function updateIoT(data) {
    const iot = getIoT();
    set('iot', { ...iot, ...data, lastUpdated: new Date().toISOString() });
  }

  // ── Process Operations ────────────────
  function getProcess() { return get('process') || {}; }

  function updateProcess(data) {
    set('process', { ...getProcess(), ...data });
  }

  // ── Summary Stats ─────────────────────
  function getTotalStats() {
    const wards = getWards();
    return {
      totalWasteCollected: wards.reduce((s, w) => s + (w.wasteCollected || 0), 0),
      totalWasteConverted: wards.reduce((s, w) => s + (w.wasteConverted || 0), 0),
      totalCarbonSaved: wards.reduce((s, w) => s + (w.carbonSaved || 0), 0),
      totalPoints: wards.reduce((s, w) => s + (w.points || 0), 0),
      totalUsers: wards.reduce((s, w) => s + (w.activeUsers || 0), 0),
      wardCount: wards.length,
    };
  }

  // ── Leaderboard ───────────────────────
  function getLeaderboard(sortBy = 'points') {
    const wards = getWards();
    return [...wards].sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }



  // ── ESP32 Web Serial API ───────────
  let port: any = null;
  let reader: any = null;

  async function connectUSB() {
    try {
      // @ts-ignore
      if (!navigator.serial) {
        alert("Web Serial API not supported in this browser. Please use Chrome or Edge.");
        return;
      }
      
      // @ts-ignore
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      updateIoT({ systemOnline: true, reactorStatus: 'idle' });
      alert("USB Connected Successfully!");
      
      // Start reading stream
      readSerialData();
    } catch (err) {
      console.error(err);
      alert("Failed to connect to USB.");
      updateIoT({ 
        temperature: 0,
        smoke: 0,
        airQuality: 0,
        moisture: 0,
        weight: 0,
        pressure: 0,
        relayOn: false,
        systemOnline: false, 
        reactorStatus: 'offline' 
      });
    }
  }

  async function readSerialData() {
    // @ts-ignore
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += value;
        const lines = buffer.split('\n');
        
        // Keep the last incomplete chunk in buffer
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              const data = JSON.parse(trimmed);
              updateIoT({
                temperature: data.temperature != null ? parseFloat(data.temperature) : 0,
                smoke: data.smoke != null ? parseFloat(data.smoke) : 0,
                airQuality: data.airQuality != null ? parseFloat(data.airQuality) : 0,
                moisture: data.moisture != null ? parseFloat(data.moisture) : 0,
                weight: data.weight != null ? parseFloat(data.weight) : 0,
                pressure: data.pressure != null ? parseFloat(data.pressure) : 0,
                relayOn: !!data.relay_on,
                systemOnline: true,
                reactorStatus: data.relay_on ? 'running' : 'idle',
              });

              // Derive Live Process Status from Sensor Data
              const temp = parseFloat(data.temperature) || 0;
              const isRelayOn = !!data.relay_on;
              
              let stage = 'collection';
              let stageLabel = 'System Idle';
              let progress = 0;

              if (isRelayOn) {
                stage = 'torrefaction';
                stageLabel = 'Torrefaction in Progress';
                // Estimate progress based on temperature (assuming target is ~300C)
                progress = Math.min(95, Math.max(10, ((temp - 30) / 270) * 100));
              } else if (temp > 60) {
                stage = 'cooling';
                stageLabel = 'Cooling Phase';
                progress = Math.min(100, Math.max(0, 100 - ((temp - 60) / 240) * 100));
              } else if (temp > 0) {
                stage = 'completed';
                stageLabel = 'Batch Complete';
                progress = 100;
              }

              const currentProcess = getProcess();
              updateProcess({
                ...currentProcess,
                stage,
                stageLabel,
                progress: progress,
                eta: isRelayOn ? `${Math.max(1, Math.round((100 - progress) * 0.4))} mins` : '—',
              });
            } catch (e) {
              console.warn("Invalid JSON from serial:", trimmed);
              console.warn(e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Serial reading error:", error);
    } finally {
      reader.releaseLock();
      updateIoT({ 
        temperature: 0,
        smoke: 0,
        airQuality: 0,
        moisture: 0,
        weight: 0,
        pressure: 0,
        relayOn: false,
        systemOnline: false, 
        reactorStatus: 'offline' 
      });
    }
  }

  async function sendSerialCommand(cmd: string) {
    if (!port) return;
    // @ts-ignore
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write(cmd + '\n');
    writer.releaseLock();
  }


  // ── Public API ────────────────────────
  return {
    WARD_DEFS,
    initDefaults,
    getWards, getWard, updateWard,
    getSchedules, updateSchedule,
    getNotices, addNotice, removeNotice, toggleNotice,
    getIoT, updateIoT,
    getProcess, updateProcess,
    getTotalStats, getLeaderboard,
    rand, randF, uid, connectUSB, sendSerialCommand,
  };
})();
