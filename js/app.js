"use strict";
/* ============================================
   Smart Waste-to-Green Coal Conversion System
   Main Application Logic
   ============================================ */
const App = (() => {
    // ── State ─────────────────────────────────────
    let currentPage = 'dashboard';
    let charts = {};
    let sensorInterval = null;
    let dashboardStats = null;
    // ── Initialize ────────────────────────────────
    function init() {
        createBackgroundParticles();
        setupNavigation();
        setupMobileMenu();
        loadPage('dashboard');
    }
    // ── Background Particles ──────────────────────
    function createBackgroundParticles() {
        const container = document.getElementById('bgParticles');
        if (!container)
            return;
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#84cc16'];
            particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        animation-duration: ${Math.random() * 20 + 15}s;
        animation-delay: ${Math.random() * 10}s;
      `;
            container.appendChild(particle);
        }
    }
    // ── Navigation ────────────────────────────────
    function setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page && page !== currentPage) {
                    loadPage(page);
                }
                // Close mobile menu
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('sidebarOverlay').classList.remove('active');
            });
        });
    }
    function setupMobileMenu() {
        const toggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
            });
        }
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            });
        }
    }
    function loadPage(page) {
        // Clear intervals
        if (sensorInterval) {
            clearInterval(sensorInterval);
            sensorInterval = null;
        }
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNav)
            activeNav.classList.add('active');
        // Update pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const activePage = document.getElementById(`page-${page}`);
        if (activePage) {
            activePage.classList.remove('active');
            // Force reflow for animation
            void activePage.offsetWidth;
            activePage.classList.add('active');
        }
        // Update topbar
        const titles = {
            'dashboard': { title: 'Dashboard', subtitle: 'Real-time system overview' },
            'monitoring': { title: 'IoT Monitor', subtitle: 'Real-time sensor data & alerts' },
            'ai-insights': { title: 'AI Insights', subtitle: 'Smart analysis & predictions' },
            'leaderboard': { title: 'Leaderboard', subtitle: 'Ward-wise gamification rankings' },
            'process': { title: 'Process', subtitle: 'How waste becomes green coal' },
        };
        const titleInfo = titles[page];
        if (titleInfo) {
            document.getElementById('pageTitle').textContent = titleInfo.title;
            document.getElementById('pageSubtitle').textContent = titleInfo.subtitle;
        }
        currentPage = page;
        // Initialize page content
        switch (page) {
            case 'dashboard':
                initDashboard();
                break;
            case 'monitoring':
                initMonitoring();
                break;
            case 'ai-insights':
                initAIInsights();
                break;
            case 'leaderboard':
                initLeaderboard();
                break;
            case 'process':
                initProcess();
                break;
        }
    }
    // ══════════════════════════════════════════════
    //  DASHBOARD
    // ══════════════════════════════════════════════
    function initDashboard() {
        dashboardStats = MockData.getDashboardStats();
        animateStatCards();
        renderConversionChart();
        renderCompositionChart();
        renderActivityFeed();
        renderSystemStatus();
    }
    function animateStatCards() {
        const stats = dashboardStats;
        const cards = [
            { el: document.getElementById('statWaste'), target: stats.wasteProcessed, suffix: '', trend: stats.wasteProcessedTrend },
            { el: document.getElementById('statCoal'), target: stats.greenCoalProduced, suffix: '', trend: stats.greenCoalTrend },
            { el: document.getElementById('statCarbon'), target: stats.carbonReduced, suffix: '', trend: stats.carbonTrend },
            { el: document.getElementById('statUsers'), target: stats.activeUsers, suffix: '', trend: stats.usersTrend },
        ];
        cards.forEach(card => {
            if (card.el) {
                animateCounter(card.el, 0, card.target, 1500);
            }
        });
    }
    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const diff = end - start;
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + diff * eased);
            element.textContent = current.toLocaleString('en-IN');
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }
    function renderConversionChart() {
        const ctx = document.getElementById('conversionChart');
        if (!ctx)
            return;
        if (charts.conversion)
            charts.conversion.destroy();
        const data = MockData.getConversionData(30);
        charts.conversion = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                        label: 'Conversion Efficiency (%)',
                        data: data.data,
                        borderColor: '#10b981',
                        backgroundColor: (ctx) => {
                            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
                            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                            return gradient;
                        },
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#10b981',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2,
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(17, 25, 40, 0.95)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => `Efficiency: ${ctx.parsed.y}%`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                        ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 8 }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                        ticks: { color: '#64748b', font: { size: 10 }, callback: v => v + '%' },
                        min: 50,
                        max: 100
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    function renderCompositionChart() {
        const ctx = document.getElementById('compositionChart');
        if (!ctx)
            return;
        if (charts.composition)
            charts.composition.destroy();
        const data = MockData.getWasteComposition();
        charts.composition = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                        data: data.data,
                        backgroundColor: data.colors,
                        borderColor: 'rgba(10, 14, 23, 0.8)',
                        borderWidth: 3,
                        hoverOffset: 8
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            padding: 12,
                            usePointStyle: true,
                            pointStyleWidth: 8
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 25, 40, 0.95)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
                        }
                    }
                }
            }
        });
    }
    function renderActivityFeed() {
        const container = document.getElementById('activityFeed');
        if (!container)
            return;
        const activities = MockData.getActivityFeed();
        container.innerHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon ${a.iconClass}">${a.icon}</div>
        <div class="activity-text">
          <p>${a.text}</p>
          <span class="activity-time">${a.time}</span>
        </div>
      </div>
    `).join('');
    }
    function renderSystemStatus() {
        const container = document.getElementById('systemStatus');
        if (!container)
            return;
        const statusItems = MockData.getSystemStatus();
        container.innerHTML = statusItems.map(s => `
      <div class="status-item">
        <div class="status-item-left">
          <span class="status-item-icon">${s.icon}</span>
          <span class="status-item-name">${s.name}</span>
        </div>
        <span class="status-tag ${s.status}">${s.status === 'operational' ? '● Operational' : '◐ Maintenance'}</span>
      </div>
    `).join('');
    }
    // ══════════════════════════════════════════════
    //  IoT MONITORING
    // ══════════════════════════════════════════════
    function initMonitoring() {
        updateSensorReadings();
        renderSensorHistoryCharts();
        renderAlerts();
        updateMonitorTime();
        // Real-time updates every 3 seconds
        sensorInterval = setInterval(() => {
            updateSensorReadings();
            updateMonitorTime();
        }, 3000);
    }
    function updateMonitorTime() {
        const el = document.getElementById('monitorTime');
        if (el) {
            el.textContent = new Date().toLocaleString('en-IN', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                day: 'numeric', month: 'short', year: 'numeric'
            });
        }
    }
    function updateSensorReadings() {
        const reading = MockData.getSensorReading();
        updateGauge('tempGauge', reading.temperature, 195, 310, '°C', 'Temperature');
        updateGauge('gasGauge', reading.gasEmission, 0, 50, 'ppm', 'Gas Emission');
        updateGauge('moistureGauge', reading.moisture, 0, 30, '%', 'Moisture');
        updateGauge('efficiencyGauge', reading.efficiency, 50, 100, '%', 'Efficiency');
    }
    function updateGauge(id, value, min, max, unit, label) {
        const card = document.getElementById(id);
        if (!card)
            return;
        const valueEl = card.querySelector('.gauge-value-text');
        const unitEl = card.querySelector('.gauge-unit');
        const statusEl = card.querySelector('.gauge-status');
        const fillEl = card.querySelector('.gauge-fill');
        if (valueEl)
            valueEl.textContent = value;
        if (unitEl)
            unitEl.textContent = unit;
        // Calculate percentage for gauge fill
        const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
        const arcLength = 188; // Approximate half-circle arc length
        if (fillEl) {
            fillEl.style.strokeDasharray = `${arcLength}`;
            fillEl.style.strokeDashoffset = `${arcLength * (1 - pct)}`;
        }
        // Determine status
        let statusText = 'Optimal';
        let statusClass = 'optimal';
        if (id === 'tempGauge') {
            if (value < 200 || value > 300) {
                statusText = 'Critical';
                statusClass = 'critical';
            }
            else if (value < 210 || value > 290) {
                statusText = 'Warning';
                statusClass = 'warning';
            }
        }
        else if (id === 'gasGauge') {
            if (value > 40) {
                statusText = 'Critical';
                statusClass = 'critical';
            }
            else if (value > 25) {
                statusText = 'Warning';
                statusClass = 'warning';
            }
        }
        else if (id === 'moistureGauge') {
            if (value > 25) {
                statusText = 'Critical';
                statusClass = 'critical';
            }
            else if (value > 20) {
                statusText = 'Warning';
                statusClass = 'warning';
            }
        }
        else if (id === 'efficiencyGauge') {
            if (value < 65) {
                statusText = 'Critical';
                statusClass = 'critical';
            }
            else if (value < 75) {
                statusText = 'Warning';
                statusClass = 'warning';
            }
        }
        if (statusEl) {
            statusEl.textContent = statusText;
            statusEl.className = `gauge-status ${statusClass}`;
        }
    }
    function renderSensorHistoryCharts() {
        const history = MockData.getSensorHistory(6);
        // Temperature History
        const tempCtx = document.getElementById('tempHistoryChart');
        if (tempCtx) {
            if (charts.tempHistory)
                charts.tempHistory.destroy();
            charts.tempHistory = new Chart(tempCtx, {
                type: 'line',
                data: {
                    labels: history.labels,
                    datasets: [{
                            label: 'Temperature (°C)',
                            data: history.tempData,
                            borderColor: '#10b981',
                            backgroundColor: createGradient(tempCtx, '#10b981'),
                            fill: true,
                            tension: 0.3,
                            borderWidth: 2,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                        }]
                },
                options: getChartOptions('°C')
            });
        }
        // Gas Emissions History
        const gasCtx = document.getElementById('gasHistoryChart');
        if (gasCtx) {
            if (charts.gasHistory)
                charts.gasHistory.destroy();
            charts.gasHistory = new Chart(gasCtx, {
                type: 'line',
                data: {
                    labels: history.labels,
                    datasets: [{
                            label: 'Gas Emission (ppm)',
                            data: history.gasData,
                            borderColor: '#f59e0b',
                            backgroundColor: createGradient(gasCtx, '#f59e0b'),
                            fill: true,
                            tension: 0.3,
                            borderWidth: 2,
                            pointRadius: 0,
                            pointHoverRadius: 5,
                        }]
                },
                options: getChartOptions(' ppm')
            });
        }
    }
    function createGradient(ctx, color) {
        const canvas = ctx.getContext ? ctx : ctx.canvas;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, color + '33');
        gradient.addColorStop(1, color + '00');
        return gradient;
    }
    function getChartOptions(unit) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 25, 40, 0.95)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                    ticks: { color: '#64748b', font: { size: 9 }, maxTicksLimit: 10 }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                    ticks: { color: '#64748b', font: { size: 10 }, callback: v => v + unit }
                }
            },
            interaction: { intersect: false, mode: 'index' }
        };
    }
    function renderAlerts() {
        const container = document.getElementById('alertsList');
        if (!container)
            return;
        const alerts = MockData.getAlerts();
        container.innerHTML = alerts.map(a => `
      <div class="alert-item">
        <div class="alert-severity ${a.severity}">${a.icon}</div>
        <div class="alert-content">
          <div class="alert-title">${a.title}</div>
          <div class="alert-desc">${a.desc}</div>
        </div>
        <span class="alert-time">${a.time}</span>
      </div>
    `).join('');
    }
    // ══════════════════════════════════════════════
    //  AI INSIGHTS
    // ══════════════════════════════════════════════
    function initAIInsights() {
        renderClassification();
        renderForecastChart();
        renderRecommendations();
        renderAnomalies();
    }
    function renderClassification() {
        const container = document.getElementById('classificationResults');
        if (!container)
            return;
        const items = MockData.getAIClassification();
        // Normalize to 100%
        const total = items.reduce((s, i) => s + i.percentage, 0);
        container.innerHTML = items.map(item => {
            const pct = Math.round(item.percentage / total * 100);
            return `
        <div class="classification-item">
          <div class="classification-label">
            <span class="classification-name">${item.name}</span>
            <span class="classification-pct">${pct}%</span>
          </div>
          <div class="classification-bar">
            <div class="classification-fill ${item.type}" style="width: 0%;" data-width="${pct}%"></div>
          </div>
        </div>
      `;
        }).join('');
        // Animate bars
        setTimeout(() => {
            container.querySelectorAll('.classification-fill').forEach(bar => {
                bar.style.width = bar.dataset.width;
            });
        }, 100);
    }
    function renderForecastChart() {
        const ctx = document.getElementById('forecastChart');
        if (!ctx)
            return;
        if (charts.forecast)
            charts.forecast.destroy();
        const data = MockData.getWasteForecast();
        charts.forecast = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Actual (kg)',
                        data: data.actual,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        pointRadius: 2,
                        pointBackgroundColor: '#10b981',
                        spanGaps: false,
                    },
                    {
                        label: 'Predicted (kg)',
                        data: data.predicted,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2.5,
                        borderDash: [6, 4],
                        pointRadius: 2,
                        pointBackgroundColor: '#8b5cf6',
                        spanGaps: false,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 25, 40, 0.95)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                        ticks: { color: '#64748b', font: { size: 10 }, maxTicksLimit: 10 }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                        ticks: { color: '#64748b', font: { size: 10 }, callback: v => v + ' kg' }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    }
    function renderRecommendations() {
        const container = document.getElementById('recommendations');
        if (!container)
            return;
        const recs = MockData.getRecommendations();
        container.innerHTML = recs.map(r => `
      <div class="recommendation-card ${r.priority}">
        <div class="recommendation-icon">${r.icon}</div>
        <h4 class="recommendation-title">${r.title}</h4>
        <p class="recommendation-text">${r.text}</p>
        <span class="recommendation-impact ${r.impact}">${r.impact} impact</span>
      </div>
    `).join('');
    }
    function renderAnomalies() {
        const container = document.getElementById('anomalyList');
        if (!container)
            return;
        const anomalies = MockData.getAnomalies();
        container.innerHTML = anomalies.map(a => `
      <div class="anomaly-item">
        <div class="anomaly-badge ${a.status}"></div>
        <div class="anomaly-info">
          <strong>${a.title}</strong>
          <span>${a.desc}</span>
        </div>
        <span class="anomaly-status ${a.status}">${a.status}</span>
      </div>
    `).join('');
    }
    // ══════════════════════════════════════════════
    //  LEADERBOARD
    // ══════════════════════════════════════════════
    let currentPeriod = 'alltime';
    let currentZone = 'all';
    let expandedWard = null;
    function initLeaderboard() {
        setupLeaderboardFilters();
        renderLeaderboard();
    }
    function setupLeaderboardFilters() {
        // Period filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentPeriod = e.target.dataset.period;
                renderLeaderboard();
            });
        });
        // Zone filter
        const zoneFilter = document.getElementById('zoneFilter');
        if (zoneFilter) {
            zoneFilter.addEventListener('change', (e) => {
                currentZone = e.target.value;
                renderLeaderboard();
            });
        }
    }
    function getFilteredLeaderboard() {
        let data = MockData.getLeaderboardData().map(ward => {
            let points;
            switch (currentPeriod) {
                case 'weekly':
                    points = ward.weeklyPoints;
                    break;
                case 'monthly':
                    points = ward.monthlyPoints;
                    break;
                default: points = ward.totalPoints;
            }
            return { ...ward, displayPoints: points };
        });
        if (currentZone !== 'all') {
            data = data.filter(w => w.zone === currentZone);
        }
        data.sort((a, b) => b.displayPoints - a.displayPoints);
        return data;
    }
    function renderLeaderboard() {
        const data = getFilteredLeaderboard();
        renderTotalStats(data);
        renderPodium(data);
        renderRankingTable(data);
    }
    function renderTotalStats(data) {
        const container = document.getElementById('lbTotalStats');
        if (!container)
            return;
        const totalPoints = data.reduce((s, w) => s + w.displayPoints, 0);
        const totalWaste = data.reduce((s, w) => s + w.totalWaste, 0);
        const totalCarbon = data.reduce((s, w) => s + w.totalCarbon, 0);
        const totalUsers = data.reduce((s, w) => s + w.activeUsers, 0);
        container.innerHTML = `
      <div class="lb-stat">
        <span class="lb-stat-value">${totalPoints.toLocaleString('en-IN')}</span>
        <span class="lb-stat-label">Total Eco-Points</span>
      </div>
      <div class="lb-stat">
        <span class="lb-stat-value">${totalWaste.toLocaleString('en-IN')} kg</span>
        <span class="lb-stat-label">Waste Collected</span>
      </div>
      <div class="lb-stat">
        <span class="lb-stat-value">${totalCarbon.toLocaleString('en-IN')} kg</span>
        <span class="lb-stat-label">CO₂ Offset</span>
      </div>
      <div class="lb-stat">
        <span class="lb-stat-value">${totalUsers.toLocaleString('en-IN')}</span>
        <span class="lb-stat-label">Active Participants</span>
      </div>
    `;
    }
    function renderPodium(data) {
        const container = document.getElementById('podium');
        if (!container || data.length < 3) {
            if (container)
                container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Not enough data for podium</p>';
            return;
        }
        // Display order: 2nd (left), 1st (center), 3rd (right)
        const podiumSlots = [
            { dataIndex: 1, medal: '🥈', label: '2nd Place', cssClass: 'second' },
            { dataIndex: 0, medal: '🥇', label: '1st Place', cssClass: 'first' },
            { dataIndex: 2, medal: '🥉', label: '3rd Place', cssClass: 'third' },
        ];
        container.innerHTML = podiumSlots.map(slot => {
            const ward = data[slot.dataIndex];
            return `
        <div class="podium-item ${slot.cssClass}">
          <div class="podium-medal">${slot.medal}</div>
          <div class="podium-rank">${slot.label}</div>
          <div class="podium-name">${ward.name}</div>
          <div class="podium-ward">Ward ${ward.id} · ${ward.zone} Zone</div>
          <div class="podium-points">${ward.displayPoints.toLocaleString('en-IN')}</div>
          <div class="podium-points-label">Eco-Points</div>
        </div>
      `;
        }).join('');
    }
    function renderRankingTable(data) {
        const tbody = document.getElementById('rankingTableBody');
        if (!tbody)
            return;
        const maxPoints = data.length > 0 ? data[0].displayPoints : 1;
        tbody.innerHTML = data.map((ward, index) => {
            const rank = index + 1;
            const medalEmoji = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : '';
            const barWidth = (ward.displayPoints / maxPoints * 100).toFixed(1);
            const topUsers = ward.users.slice(0, 5);
            const contributorsHTML = topUsers.map((u, ui) => `
        <div class="contributor">
          <div class="contributor-rank">${ui + 1}</div>
          <span class="contributor-name">${u.name}</span>
          <span class="contributor-pts">${u.points.toLocaleString('en-IN')} pts</span>
        </div>
      `).join('');
            return `
        <tr class="ward-row" data-ward-id="${ward.id}" onclick="App.toggleWardDetails(${ward.id})">
          <td>
            ${medalEmoji ? `<span class="rank-medal">${medalEmoji}</span>` : `<span class="rank-number">${rank}</span>`}
          </td>
          <td>
            <span class="ward-name-cell">${ward.name}</span>
            <span style="display: block; font-size: 11px; color: var(--text-muted);">Ward ${ward.id}</span>
          </td>
          <td><span class="zone-badge ${ward.zone.toLowerCase()}">${ward.zone}</span></td>
          <td>
            <div class="points-bar-container">
              <span class="points-cell">${ward.displayPoints.toLocaleString('en-IN')}</span>
              <div class="points-bar">
                <div class="points-bar-fill" style="width: ${barWidth}%"></div>
              </div>
            </div>
          </td>
          <td style="font-family: 'JetBrains Mono', monospace; font-size: 13px;">${ward.totalWaste.toLocaleString('en-IN')} kg</td>
          <td style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--primary);">${ward.totalCarbon.toLocaleString('en-IN')} kg</td>
          <td style="text-align: center;">${ward.activeUsers}</td>
        </tr>
        <tr class="ward-details" id="wardDetails-${ward.id}">
          <td colspan="7">
            <div class="ward-details-content">
              <h4>🏆 Top Contributors — ${ward.name}</h4>
              <div class="top-contributors">${contributorsHTML}</div>
            </div>
          </td>
        </tr>
      `;
        }).join('');
    }
    function toggleWardDetails(wardId) {
        const detailsRow = document.getElementById(`wardDetails-${wardId}`);
        if (!detailsRow)
            return;
        if (expandedWard === wardId) {
            detailsRow.classList.remove('expanded');
            expandedWard = null;
        }
        else {
            // Close previously expanded
            document.querySelectorAll('.ward-details.expanded').forEach(el => el.classList.remove('expanded'));
            detailsRow.classList.add('expanded');
            expandedWard = wardId;
        }
    }
    // ══════════════════════════════════════════════
    //  PROCESS PAGE
    // ══════════════════════════════════════════════
    function initProcess() {
        // Process steps are rendered in HTML
        // Just trigger animations
        const steps = document.querySelectorAll('.process-step');
        steps.forEach((step, i) => {
            step.style.animationDelay = `${i * 0.15}s`;
        });
    }
    // ── Public API ────────────────────────────────
    return {
        init,
        loadPage,
        toggleWardDetails,
    };
})();
// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
