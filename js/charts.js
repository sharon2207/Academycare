// =============================================
// AcademiCare  Chart Renderers (Chart.js)
// All analytics visualizations
// =============================================

Chart.defaults.color = '#71717a';
Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';
Chart.defaults.font.family = "'Inter', sans-serif";

const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

function drawLSTMChart(dbHistory = null) {
  destroyChart('lstmChart');
  const ctx = document.getElementById('lstmChart');
  if (!ctx) return;
  
  let labels, hist, pred;
  
  if (dbHistory && dbHistory.length > 0) {
    // Dynamic history from DB
    const last10 = dbHistory.slice(-10);
    labels = [...last10.map(r => new Date(r.score_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'})), ...['D+1','D+2','D+3','D+4','D+5','D+6','D+7']];
    hist = [...last10.map(r => r.burnout_score)];
    
    // Simulate LSTM prediction projection (based on last score + exams)
    const lastScore = hist[hist.length - 1];
    const forecast = [];
    let currentTemp = lastScore;
    for (let i = 1; i <= 7; i++) {
      // Simulate slight rise if high, or return to baseline
      currentTemp = Math.max(10, Math.min(98, Math.round(currentTemp + (currentTemp > 60 ? 1.5 : -0.5) + (Math.random() * 4 - 2))));
      forecast.push(currentTemp);
    }
    pred = [...new Array(hist.length).fill(null), ...forecast];
  } else {
    // Fallback Mock Data
    const data = AcademiData.stressTrend30Days;
    labels = [...data.labels.slice(-10), ...['D+1','D+2','D+3','D+4','D+5','D+6','D+7']];
    hist = [...data.burnoutScores.slice(-10)];
    pred = [...new Array(10).fill(null), ...data.lstmPrediction];
  }
  
  const histFull = [...hist, ...new Array(7).fill(null)];

  chartInstances['lstmChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Historical Burnout Score',
          data: histFull,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          fill: true,
          tension: 0.4
        },
        {
          label: 'LSTM Prediction (Next 7 Days)',
          data: pred,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.08)',
          borderWidth: 2.5,
          borderDash: [6, 4],
          pointRadius: 5,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ef4444',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#18181b',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#fafafa',
          bodyColor: '#a1a1aa',
          padding: 12,
          callbacks: {
            label: ctx => ctx.dataset.label + ': ' + (ctx.raw !== null ? ctx.raw : 'N/A')
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { maxTicksLimit: 10 } },
        y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { stepSize: 20 } }
      }
    }
  });
}

function drawAnalyticsCharts(dbHistory = null, academicData = null) {
  //  30-Day Trend Chart 
  destroyChart('trendChart30');
  const ctx1 = document.getElementById('trendChart30');
  if (ctx1 && dbHistory && dbHistory.length > 0) {
    const labels = dbHistory.map(r => new Date(r.score_date).toLocaleDateString('en-IN', {day:'numeric', month:'short'}));
    const burnoutScores = dbHistory.map(r => r.burnout_score);
    const sleepHours = dbHistory.map(r => r.sleep_hours);
    const moodScores = dbHistory.map(r => r.mood_score);
    
    chartInstances['trendChart30'] = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Burnout Score',
            data: burnoutScores,
            borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
            borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 3
          },
          {
            label: 'Sleep Hours (8)',
            data: sleepHours.map(v => v * 8),
            borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.05)',
            borderWidth: 2, fill: false, tension: 0.4, pointRadius: 2, borderDash: [4,4]
          },
          {
            label: 'Mood Score (10)',
            data: moodScores.map(v => v * 10),
            borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.05)',
            borderWidth: 2, fill: false, tension: 0.4, pointRadius: 2, borderDash: [2,4]
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10 } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { maxTicksLimit: 10 } },
          y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }

  //  Attendance Bar Chart 
  destroyChart('attendChart');
  const ctx2 = document.getElementById('attendChart');
  if (ctx2 && academicData && academicData.length > 0) {
    chartInstances['attendChart'] = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: academicData.map(a => (a.subject_code ? a.subject_code : a.subject_name || a.subject)),
        datasets: [
          {
            label: 'Attendance %',
            data: academicData.map(a => a.attendance_pct !== undefined ? a.attendance_pct : a.attendance),
            backgroundColor: academicData.map(a => (a.attendance_pct !== undefined ? a.attendance_pct : a.attendance) < 75 ? 'rgba(239,68,68,0.7)' : 'rgba(16,185,129,0.7)'),
            borderRadius: 6, borderSkipped: false
          },
          {
            label: 'Internal Marks %',
            data: academicData.map(a => a.internal_marks !== undefined ? a.internal_marks : a.marks),
            backgroundColor: 'rgba(99,102,241,0.6)',
            borderRadius: 6, borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10 } },
        scales: {
          x: { grid: { display: false } },
          y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }

  //  Feature Importance (Random Forest) 
  destroyChart('featureChart');
  const ctx3 = document.getElementById('featureChart');
  if (ctx3) {
    chartInstances['featureChart'] = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: ['Sleep', 'Mood', 'Attendance', 'Marks', 'Study', 'GATE', 'Deadline', 'Placement', 'Family', 'Activity', 'Isolation', 'Screen'],
        datasets: [{
          label: 'Feature Importance',
          data: [0.22, 0.18, 0.16, 0.12, 0.09, 0.08, 0.06, 0.04, 0.03, 0.02, 0.01, 0.01],
          backgroundColor: [
            'rgba(239,68,68,0.8)', 'rgba(99,102,241,0.8)', 'rgba(245,158,11,0.8)',
            'rgba(16,185,129,0.8)', 'rgba(139,92,246,0.8)', 'rgba(236,72,153,0.8)',
            'rgba(59,130,246,0.8)', 'rgba(249,115,22,0.8)', 'rgba(20,184,166,0.8)',
            'rgba(99,102,241,0.5)', 'rgba(245,158,11,0.5)', 'rgba(239,68,68,0.5)'
          ],
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10 } },
        scales: {
          x: { max: 0.25, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => (v*100).toFixed(0)+'%' } },
          y: { grid: { display: false } }
        }
      }
    });
  }

  //  Resilience History 
  destroyChart('resilienceChart');
  const ctx4 = document.getElementById('resilienceChart');
  if (ctx4) {
    chartInstances['resilienceChart'] = new Chart(ctx4, {
      type: 'line',
      data: {
        labels: ['Episode 1\nMar 10', 'Peak', 'Recovery 1', 'Episode 2\nApr 18', 'Peak', 'Recovery 2', 'Episode 3\nMay 15', 'Peak', 'Recovery 3'],
        datasets: [{
          label: 'Burnout Score',
          data: [50, 82, 55, 48, 77, 52, 45, 71, 48],
          borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
          borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 5,
          pointBackgroundColor: ctx => ctx.raw > 70 ? '#ef4444' : '#10b981',
          pointRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10 } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 5 } },
          y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }
}

function drawCounselorCharts() {
  //  Risk Distribution Donut 
  destroyChart('riskDistChart');
  const ctx1 = document.getElementById('riskDistChart');
  if (ctx1) {
    const dist = AcademiData.batchAnalytics.riskDistribution;
    chartInstances['riskDistChart'] = new Chart(ctx1, {
      type: 'doughnut',
      data: {
        labels: ['Low', 'Moderate', 'High', 'Critical'],
        datasets: [{
          data: [dist.low, dist.moderate, dist.high, dist.critical],
          backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(249,115,22,0.8)', 'rgba(239,68,68,0.8)'],
          borderColor: '#18181b', borderWidth: 3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } },
          tooltip: { backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10 }
        }
      }
    });
  }

  //  Weekly Batch Trend 
  destroyChart('batchTrendChart');
  const ctx2 = document.getElementById('batchTrendChart');
  if (ctx2) {
    chartInstances['batchTrendChart'] = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          label: 'Avg Burnout Score',
          data: AcademiData.batchAnalytics.weeklyTrend,
          borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)',
          borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 8 } },
        scales: {
          x: { grid: { display: false } },
          y: { min: 40, max: 70, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }
}
