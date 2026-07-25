// =============================================
// AcademiCare  Mock Data Store
// Simulates AWS RDS + ML Engine responses
// =============================================

const AcademiData = {

  //  CURRENT STUDENT (reads from localStorage) 
  get currentStudent() {
    const u = JSON.parse(localStorage.getItem('academicare_user') || 'null');
    return u || {
      id: 1, name: 'Demo Student', email: 'arjun.sharma@christuniversity.in',
      department: 'MCA', year: 2, section: 'B', rollNo: 'MCA24B00',
      gatePrep: false, placementSeason: false, familyPressure: false, avatar: 'DS'
    };
  },

  //  BURNOUT SCORE (Random Forest Output) 
  burnoutScore: {
    current: 67,
    riskLevel: 'High',
    previousScore: 58,
    change: +9,
    confidence: 0.84,
    breakdown: {
      mood: { score: 6, weight: 0.18, contribution: 1.08 },
      sleep: { score: 5.2, weight: 0.22, contribution: 1.144 },
      study: { score: 7.8, weight: 0.15, contribution: 1.17 },
      attendance: { score: 72, weight: 0.16, contribution: 11.52 },
      marks: { score: 68, weight: 0.12, contribution: 8.16 },
      daysToExam: { score: 8, weight: 0.08, contribution: 0.64 },
      deadlines: { score: 3, weight: 0.09, contribution: 0.27 }
    }
  },

  //  WELLNESS RECOMMENDATIONS 
  recommendations: [
    {
      icon: '😴',
      title: 'Improve Sleep Quality',
      text: 'Your 5.2 hours of sleep is critically below the 78 hour threshold. Sleep deprivation is your #1 burnout driver today.',
      category: 'sleep',
      priority: 'critical'
    },
    {
      icon: '',
      title: 'Implement Pomodoro Technique',
      text: 'You\'re studying 7.8 hours straight. Break sessions into 25-min focus + 5-min rest to retain 40% more information.',
      category: 'study',
      priority: 'high'
    },
    {
      icon: '🧘',
      title: '10-Minute Mindfulness',
      text: 'With GATE prep + placement pressure, try the Headspace app for 10 minutes daily. Reduces cortisol by 23%.',
      category: 'mental',
      priority: 'high'
    },
    {
      icon: '🚶',
      title: 'Evening Walk Recommended',
      text: '30 minutes of outdoor walking lowers stress hormones and resets your circadian rhythm for better sleep tonight.',
      category: 'physical',
      priority: 'moderate'
    },
    {
      icon: '👥',
      title: 'Join Peer Study Group',
      text: 'You\'ve been matched with 4 students in Cluster A who share your GATE stress profile. Study together this weekend.',
      category: 'social',
      priority: 'moderate'
    }
  ],

  //  30-DAY STRESS TREND (LSTM Input/Output) 
  stressTrend30Days: {
    labels: Array.from({length: 30}, (_, i) => {
      const d = new Date('2026-05-28');
      d.setDate(d.getDate() + i);
      return d.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
    }),
    burnoutScores: [42, 44, 41, 47, 50, 53, 49, 55, 58, 54, 61, 63, 59, 62, 65, 60, 66, 64, 68, 70, 67, 65, 69, 71, 68, 73, 70, 72, 69, 67],
    sleepHours:   [7.1, 7.0, 6.8, 6.5, 7.2, 6.9, 7.0, 6.4, 6.1, 6.8, 6.2, 5.9, 6.5, 5.8, 5.5, 6.2, 5.6, 5.8, 5.4, 5.1, 5.2, 5.8, 5.3, 5.0, 5.6, 4.9, 5.4, 5.2, 5.7, 5.2],
    moodScores:   [7.5, 7.2, 7.8, 7.0, 6.8, 7.1, 7.4, 6.6, 6.3, 7.0, 6.4, 6.1, 6.8, 6.2, 5.9, 6.5, 5.7, 6.0, 5.8, 5.4, 6.0, 6.2, 5.6, 5.3, 6.0, 5.1, 5.8, 5.5, 6.1, 6.0],
    // LSTM Prediction next 7 days
    lstmPrediction: [68, 71, 74, 77, 79, 82, 84]
  },

  //  EXAM TIMETABLE (loaded dynamically from localStorage + API per student) 
  get examTimetable() {
    const email = this.currentStudent.email || 'guest';
    const stored = JSON.parse(localStorage.getItem('academicare_exams_' + email) || '[]');
    const today  = new Date(); today.setHours(0,0,0,0);
    return stored
      .map(e => {
        const examD   = new Date(e.examDate); examD.setHours(0,0,0,0);
        const daysLeft = Math.ceil((examD - today) / 86400000);
        const status   = daysLeft <= 3 ? 'soon' : daysLeft <= 10 ? 'upcoming' : 'ok';
        const stress   = Math.min(100, Math.round(85 - daysLeft * 2.5 + (e.weight || 0) * 10));
        return { ...e, daysLeft, status, predictedStress: Math.max(30, stress) };
      })
      .filter(e => e.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  },

  //  ATTENDANCE & MARKS (Populated dynamically per student input) 
  academicData: [],

  //  SUBJECT ASSIGNMENT DEADLINE CORRELATION 
  facultyCorrelation: [],

  //  K-MEANS PEER GROUPS 
  peerGroups: [
    {
      clusterId: 'A', clusterName: 'High-Stress GATE Prep Group',
      stressProfile: 'High Burnout + GATE/CAT Prep',
      matchReason: 'Similar stress patterns during exam weeks',
      members: [
        { name: 'Arjun Sharma', score: 67, initials: 'AS', isYou: true },
        { name: 'Priya Krishnan', score: 71, initials: 'PK' },
        { name: 'Rahul Verma', score: 65, initials: 'RV' },
        { name: 'Sneha Patel', score: 69, initials: 'SP' }
      ],
      meetingTime: 'Saturdays 46 PM',
      focusArea: 'GATE + Cloud Computing'
    },
    {
      clusterId: 'B', clusterName: 'Moderate Stress Achievers',
      stressProfile: 'Moderate Burnout + Good Sleep Habits',
      matchReason: 'Consistent study patterns with manageable stress',
      members: [
        { name: 'Kavya Reddy', score: 42, initials: 'KR' },
        { name: 'Aditya Joshi', score: 45, initials: 'AJ' },
        { name: 'Meera Singh', score: 39, initials: 'MS' },
        { name: 'Rohit Sharma', score: 48, initials: 'RS' }
      ],
      meetingTime: 'Wednesdays 57 PM',
      focusArea: 'ML + Data Science'
    },
    {
      clusterId: 'C', clusterName: 'Placement Season Warriors',
      stressProfile: 'High Placement Anxiety + Moderate Academic Stress',
      matchReason: 'Peak stress during placement drives',
      members: [
        { name: 'Ananya Gupta', score: 73, initials: 'AG' },
        { name: 'Vikram Nair', score: 68, initials: 'VN' },
        { name: 'Pooja Iyer', score: 75, initials: 'PI' }
      ],
      meetingTime: 'Sundays 35 PM',
      focusArea: 'Interview Prep + DSA'
    },
    {
      clusterId: 'D', clusterName: 'Low Stress High Performers',
      stressProfile: 'Low Burnout + Excellent Self-Regulation',
      matchReason: 'Strong coping mechanisms and time management',
      members: [
        { name: 'Nikhil Mehta', score: 22, initials: 'NM' },
        { name: 'Divya Pillai', score: 18, initials: 'DP' },
        { name: 'Saurabh Roy', score: 25, initials: 'SR' }
      ],
      meetingTime: 'Fridays 68 PM',
      focusArea: 'Research + Projects'
    }
  ],

  //  COUNSELOR ALERTS 
  counselorAlerts: [
    { anonymousId: 'ANON-4421', riskLevel: 'Critical', score: 89, triggeredAt: '2 hours ago', department: 'MCA', triggers: ['Sleep < 4h for 5 days', 'Exam in 2 days', 'Mood = 2/10'], resolved: false },
    { anonymousId: 'ANON-8834', riskLevel: 'Critical', score: 83, triggeredAt: '5 hours ago', department: 'MCA', triggers: ['3-day isolation pattern', 'Attendance 48%', 'GATE pressure flag'], resolved: false },
    { anonymousId: 'ANON-2219', riskLevel: 'High', score: 76, triggeredAt: '1 day ago', department: 'MCA', triggers: ['Family stress flag', 'Sleep 4.8h avg', 'Score rising trend'], resolved: false },
    { anonymousId: 'ANON-5567', riskLevel: 'High', score: 74, triggeredAt: '2 days ago', department: 'MCA', triggers: ['Placement anxiety flag', 'Mood declined 40%', 'Study hours excessive'], resolved: true },
    { anonymousId: 'ANON-3312', riskLevel: 'High', score: 71, triggeredAt: '3 days ago', department: 'MCA', triggers: ['Multiple deadline overlap', 'Sleep disruption pattern'], resolved: true }
  ],

  //  RESILIENCE SCORE 
  resilienceScore: {
    current: 72,
    episodes: [
      { start: '2026-03-10', end: '2026-03-24', peakScore: 82, recoveryDays: 14, recoveryScore: 68 },
      { start: '2026-04-18', end: '2026-04-28', peakScore: 77, recoveryDays: 10, recoveryScore: 74 },
      { start: '2026-05-15', end: '2026-05-22', peakScore: 71, recoveryDays: 7, recoveryScore: 79 }
    ],
    trend: 'improving',
    avgRecoveryDays: 10.3
  },

  //  BATCH ANALYTICS (Admin View) 
  batchAnalytics: {
    totalStudents: 64,
    riskDistribution: { low: 18, moderate: 24, high: 16, critical: 6 },
    avgBurnoutScore: 54.2,
    avgSleepHours: 6.1,
    avgMoodScore: 6.4,
    checkInStreak: 14,
    weeklyTrend: [48, 51, 53, 55, 57, 54, 58]
  }

};

//  SIMULATED ML SCORING FUNCTION 
function computeBurnoutScore(checkinData) {
  // Simulates Random Forest inference
  const weights = { mood: -3.2, sleep: -4.1, study: 1.8, placement: 8, family: 5, gate: 6, isolation: 7 };
  let score = 50;
  score += weights.mood * (checkinData.mood - 7) / 3;
  score += weights.sleep * (7 - checkinData.sleep) / 2;
  score += weights.study * (checkinData.study - 5) / 3;
  if (checkinData.placement) score += weights.placement;
  if (checkinData.family) score += weights.family;
  if (checkinData.gate) score += weights.gate;
  if (checkinData.isolation) score += weights.isolation;
  score = Math.max(0, Math.min(100, Math.round(score + (Math.random() * 6 - 3))));
  
  let riskLevel;
  if (score < 30) riskLevel = 'Low';
  else if (score < 55) riskLevel = 'Moderate';
  else if (score < 75) riskLevel = 'High';
  else riskLevel = 'Critical';
  
  return { score, riskLevel };
}

// Risk level colors
function getRiskColor(level) {
  const colors = { Low: '#10b981', Moderate: '#f59e0b', High: '#f97316', Critical: '#ef4444' };
  return colors[level] || '#6366f1';
}
function getRiskGaugeOffset(score) {
  return 157 - (score / 100 * 157);
}
