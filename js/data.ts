/* ============================================
   Smart Waste-to-Green Coal Conversion System
   Mock Data Module
   ============================================ */

const MockData = (() => {

  // ── Ward Definitions ──────────────────────────
  const wards = [
    { id: 1, name: "Shanti Nagar", zone: "North" },
    { id: 2, name: "Gandhi Chowk", zone: "North" },
    { id: 3, name: "Nehru Colony", zone: "East" },
    { id: 4, name: "Rajiv Garden", zone: "East" },
    { id: 5, name: "Ambedkar Nagar", zone: "South" },
    { id: 6, name: "Tagore Park", zone: "South" },
    { id: 7, name: "Subhash Ward", zone: "West" },
    { id: 8, name: "Patel Colony", zone: "West" },
    { id: 9, name: "Bose Nagar", zone: "Central" },
    { id: 10, name: "Vivekananda Ward", zone: "Central" },
    { id: 11, name: "Sardar Enclave", zone: "North" },
    { id: 12, name: "Indira Nagar", zone: "East" },
    { id: 13, name: "Lakshmi Bai Colony", zone: "South" },
    { id: 14, name: "Azad Ward", zone: "West" },
    { id: 15, name: "Bhagat Singh Nagar", zone: "Central" },
  ];

  // ── Name Pool ─────────────────────────────────
  const firstNames = [
    "Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Rohan", "Karan", "Dev",
    "Ishaan", "Dhruv", "Ananya", "Priya", "Sneha", "Kavya", "Riya", "Meera",
    "Neha", "Pooja", "Aisha", "Diya", "Vikram", "Raj", "Suresh", "Amit",
    "Deepa", "Sunita", "Geeta", "Lakshmi", "Rahul", "Manish", "Anjali",
    "Vishal", "Shreya", "Tanvi", "Sakshi", "Nikhil", "Gaurav", "Harsh",
    "Preeti", "Swati", "Mohan", "Rekha", "Suman", "Pankaj", "Nisha"
  ];

  const lastNames = [
    "Sharma", "Patel", "Kumar", "Singh", "Reddy", "Gupta", "Joshi",
    "Verma", "Das", "Mehta", "Nair", "Iyer", "Rao", "Mishra", "Tiwari",
    "Chauhan", "Agarwal", "Bhatia", "Sinha", "Malhotra", "Saxena",
    "Pandey", "Kapoor", "Banerjee", "Mukherjee", "Ghosh", "Menon"
  ];

  // ── Utility Functions ─────────────────────────
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomFloat(min, max, decimals = 1) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateName() {
    return `${randomFromArray(firstNames)} ${randomFromArray(lastNames)}`;
  }

  // ── Generate User Data ────────────────────────
  function generateUsers(count) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: i + 1,
        name: generateName(),
        points: randomBetween(50, 2500),
        wasteCollected: randomFloat(5, 300),
        carbonSaved: randomFloat(2, 150),
        daysActive: randomBetween(5, 90),
        avatar: `${randomFromArray(firstNames).charAt(0)}${randomFromArray(lastNames).charAt(0)}`
      });
    }
    return users.sort((a, b) => b.points - a.points);
  }

  // ── Leaderboard Data ──────────────────────────
  let leaderboardData = null;

  function getLeaderboardData() {
    if (leaderboardData) return leaderboardData;

    leaderboardData = wards.map(ward => {
      const users = generateUsers(randomBetween(15, 40));
      const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
      const totalWaste = users.reduce((sum, u) => sum + u.wasteCollected, 0);
      const totalCarbon = users.reduce((sum, u) => sum + u.carbonSaved, 0);

      return {
        ...ward,
        totalPoints,
        totalWaste: parseFloat(totalWaste.toFixed(1)),
        totalCarbon: parseFloat(totalCarbon.toFixed(1)),
        activeUsers: users.length,
        users: users,
        weeklyPoints: Math.floor(totalPoints * randomFloat(0.15, 0.3)),
        monthlyPoints: Math.floor(totalPoints * randomFloat(0.5, 0.7)),
      };
    });

    leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);
    return leaderboardData;
  }

  // ── Dashboard Stats ───────────────────────────
  function getDashboardStats() {
    return {
      wasteProcessed: randomBetween(11000, 14000),
      greenCoalProduced: randomBetween(3500, 5500),
      carbonReduced: randomBetween(6000, 8500),
      activeUsers: randomBetween(450, 650),
      wasteProcessedTrend: randomFloat(8, 18),
      greenCoalTrend: randomFloat(5, 15),
      carbonTrend: randomFloat(10, 22),
      usersTrend: randomFloat(3, 12),
    };
  }

  // ── Conversion Efficiency Data ────────────────
  function getConversionData(days = 30) {
    const data = [];
    const labels = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));

      // Simulate slightly increasing efficiency with some variance
      const baseEfficiency = 65 + (days - i) * 0.3;
      data.push(parseFloat((baseEfficiency + randomFloat(-5, 5)).toFixed(1)));
    }

    return { labels, data };
  }

  // ── Waste Composition Data ────────────────────
  function getWasteComposition() {
    return {
      labels: ['Food Waste', 'Garden Waste', 'Paper/Cardboard', 'Wood Scraps', 'Agricultural', 'Other Organic'],
      data: [35, 22, 15, 12, 10, 6],
      colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#84cc16', '#64748b']
    };
  }

  // ── Sensor Data ───────────────────────────────
  let sensorState = {
    temperature: 245,
    gasEmission: 12.5,
    moisture: 15.2,
    efficiency: 82.5
  };

  function getSensorReading() {
    // Simulate slight variations from previous reading
    sensorState.temperature = Math.max(195, Math.min(305,
      sensorState.temperature + randomFloat(-3, 3)));
    sensorState.gasEmission = Math.max(2, Math.min(50,
      sensorState.gasEmission + randomFloat(-1.5, 1.5)));
    sensorState.moisture = Math.max(3, Math.min(30,
      sensorState.moisture + randomFloat(-1, 1)));
    sensorState.efficiency = Math.max(60, Math.min(98,
      sensorState.efficiency + randomFloat(-2, 2)));

    return {
      temperature: parseFloat(sensorState.temperature.toFixed(1)),
      gasEmission: parseFloat(sensorState.gasEmission.toFixed(1)),
      moisture: parseFloat(sensorState.moisture.toFixed(1)),
      efficiency: parseFloat(sensorState.efficiency.toFixed(1)),
      timestamp: new Date()
    };
  }

  // ── Historical Sensor Data ────────────────────
  function getSensorHistory(hours = 6) {
    const points = hours * 6; // One reading every 10 minutes
    const tempData = [];
    const gasData = [];
    const moistureData = [];
    const efficiencyData = [];
    const labels = [];

    let temp = 240, gas = 14, moisture = 16, eff = 80;
    const now = new Date();

    for (let i = points - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 10 * 60 * 1000);
      labels.push(time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

      temp = Math.max(195, Math.min(305, temp + randomFloat(-4, 4)));
      gas = Math.max(2, Math.min(50, gas + randomFloat(-2, 2)));
      moisture = Math.max(3, Math.min(30, moisture + randomFloat(-1, 1)));
      eff = Math.max(60, Math.min(98, eff + randomFloat(-2, 2)));

      tempData.push(parseFloat(temp.toFixed(1)));
      gasData.push(parseFloat(gas.toFixed(1)));
      moistureData.push(parseFloat(moisture.toFixed(1)));
      efficiencyData.push(parseFloat(eff.toFixed(1)));
    }

    return { labels, tempData, gasData, moistureData, efficiencyData };
  }

  // ── Activity Feed ─────────────────────────────
  function getActivityFeed() {
    const activities = [
      { icon: "♻️", iconClass: "green", text: `<strong>${generateName()}</strong> disposed 12kg of organic waste`, time: "2 mins ago" },
      { icon: "🏭", iconClass: "blue", text: `Batch #${randomBetween(100, 999)} torrefaction completed — <strong>${randomFloat(45, 85)}kg</strong> green coal produced`, time: "15 mins ago" },
      { icon: "🏆", iconClass: "amber", text: `<strong>${randomFromArray(wards).name}</strong> reached <strong>${randomBetween(5000, 15000)} pts</strong> milestone`, time: "32 mins ago" },
      { icon: "🤖", iconClass: "violet", text: `AI detected high-quality biomass batch — efficiency boost recommended`, time: "45 mins ago" },
      { icon: "📡", iconClass: "blue", text: `IoT sensors calibrated — all readings nominal`, time: "1 hour ago" },
      { icon: "♻️", iconClass: "green", text: `<strong>${generateName()}</strong> earned <strong>${randomBetween(50, 200)} pts</strong> for waste segregation`, time: "1.5 hours ago" },
      { icon: "⚡", iconClass: "amber", text: `Energy output increased by <strong>${randomFloat(3, 8)}%</strong> this shift`, time: "2 hours ago" },
      { icon: "🌱", iconClass: "green", text: `Carbon offset: <strong>${randomFloat(15, 45)}kg CO₂</strong> saved in last batch`, time: "2.5 hours ago" },
    ];
    return activities;
  }

  // ── System Status ─────────────────────────────
  function getSystemStatus() {
    return [
      { icon: "🌡️", name: "Torrefaction Reactor", status: "operational", value: `${randomBetween(240, 260)}°C` },
      { icon: "💨", name: "Gas Scrubber", status: "operational", value: "Active" },
      { icon: "🔄", name: "Conveyor System", status: "operational", value: `${randomBetween(85, 98)}%` },
      { icon: "⚡", name: "Power Unit", status: "operational", value: `${randomFloat(2.1, 3.5)} kW` },
      { icon: "💧", name: "Moisture Sensor", status: Math.random() > 0.8 ? "maintenance" : "operational", value: `${randomFloat(12, 18)}%` },
      { icon: "📡", name: "Cloud Uplink", status: "operational", value: "Connected" },
    ];
  }

  // ── AI Classification ─────────────────────────
  function getAIClassification() {
    return [
      { name: "Biodegradable Organic", percentage: randomBetween(55, 70), type: "bio" },
      { name: "Paper & Cardboard", percentage: randomBetween(10, 18), type: "paper" },
      { name: "Plastic (Rejected)", percentage: randomBetween(5, 12), type: "plastic" },
      { name: "Metal (Rejected)", percentage: randomBetween(2, 6), type: "metal" },
      { name: "Glass (Rejected)", percentage: randomBetween(1, 4), type: "glass" },
      { name: "Other Materials", percentage: randomBetween(2, 8), type: "other" },
    ];
  }

  // ── AI Forecast ───────────────────────────────
  function getWasteForecast() {
    const labels = [];
    const actual = [];
    const predicted = [];
    const now = new Date();

    // Past 14 days actual
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
      actual.push(randomBetween(350, 550));
      predicted.push(null);
    }

    // Next 7 days predicted
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      labels.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
      actual.push(null);
      predicted.push(randomBetween(380, 520));
    }

    return { labels, actual, predicted };
  }

  // ── AI Recommendations ────────────────────────
  function getRecommendations() {
    return [
      {
        icon: "🌡️",
        title: "Optimize Temperature",
        text: "Current torrefaction temperature can be increased by 8°C for better carbon retention. Predicted efficiency gain: 4.2%",
        impact: "high",
        priority: "high"
      },
      {
        icon: "💧",
        title: "Pre-drying Enhancement",
        text: "Moisture levels in incoming batch are above optimal. Recommend extending pre-drying phase by 15 minutes.",
        impact: "high",
        priority: "high"
      },
      {
        icon: "⏱️",
        title: "Batch Timing",
        text: "Peak waste collection occurs between 8-10 AM. Schedule torrefaction batches starting 11 AM for optimal throughput.",
        impact: "medium",
        priority: "medium"
      },
      {
        icon: "🔧",
        title: "Sensor Maintenance",
        text: "Gas emission sensor #3 showing drift. Schedule calibration within next 48 hours to maintain accuracy.",
        impact: "medium",
        priority: "medium"
      },
      {
        icon: "📊",
        title: "Waste Mix Optimization",
        text: "Mixing 70% food waste with 30% garden waste yields highest calorific value in green coal output.",
        impact: "high",
        priority: "low"
      },
      {
        icon: "🌿",
        title: "Carbon Credit Report",
        text: "Monthly carbon offset qualifies for additional sustainability credits. Generate report for municipal review.",
        impact: "low",
        priority: "low"
      }
    ];
  }

  // ── Anomaly Detection ─────────────────────────
  function getAnomalies() {
    return [
      {
        title: "Temperature spike detected in Zone B",
        desc: "Reached 312°C briefly before auto-correction",
        status: "resolved",
        time: "Today, 2:15 PM"
      },
      {
        title: "Gas emission sensor #3 drift",
        desc: "Readings 8% higher than cross-reference sensors",
        status: "investigating",
        time: "Today, 11:30 AM"
      },
      {
        title: "Unusual waste composition in Batch #847",
        desc: "Higher than normal plastic contamination (18%)",
        status: "resolved",
        time: "Yesterday, 4:45 PM"
      },
      {
        title: "Conveyor belt speed variation",
        desc: "Minor RPM fluctuation detected — monitoring",
        status: "investigating",
        time: "Yesterday, 1:20 PM"
      },
      {
        title: "Cloud uplink latency spike",
        desc: "Data transmission delay of 2.3s — resolved automatically",
        status: "resolved",
        time: "2 days ago"
      }
    ];
  }

  // ── Alerts for Monitoring ─────────────────────
  function getAlerts() {
    return [
      { severity: "info", icon: "ℹ️", title: "System calibration complete", desc: "All sensors recalibrated successfully", time: "10 mins ago" },
      { severity: "warn", icon: "⚠️", title: "Moisture level slightly high", desc: "Incoming batch moisture at 22% — pre-drying recommended", time: "25 mins ago" },
      { severity: "info", icon: "ℹ️", title: "Batch #851 started", desc: "Torrefaction process initiated — ETA 45 mins", time: "30 mins ago" },
      { severity: "warn", icon: "⚠️", title: "Gas sensor drift detected", desc: "Sensor #3 showing 8% deviation — scheduled for maintenance", time: "1 hour ago" },
      { severity: "error", icon: "🚨", title: "Temperature exceeded threshold", desc: "Zone B reached 312°C — auto-correction applied", time: "2 hours ago" },
      { severity: "info", icon: "ℹ️", title: "Cloud sync successful", desc: "All data uploaded to cloud dashboard", time: "2.5 hours ago" },
    ];
  }

  // ── Public API ────────────────────────────────
  return {
    wards,
    getLeaderboardData,
    getDashboardStats,
    getConversionData,
    getWasteComposition,
    getSensorReading,
    getSensorHistory,
    getActivityFeed,
    getSystemStatus,
    getAIClassification,
    getWasteForecast,
    getRecommendations,
    getAnomalies,
    getAlerts,
    randomBetween,
    randomFloat,
  };
})();
