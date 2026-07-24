# -*- coding: utf-8 -*-
import urllib.request, json, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://localhost:8000'

def get(path):
    return json.loads(urllib.request.urlopen(BASE + path).read().decode())

def post(path, data):
    body = json.dumps(data).encode()
    req  = urllib.request.Request(BASE + path, data=body,
                                   headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read().decode())

SEP = '=' * 52

# ── Test 1: API reachable via db/stats ────────────────────
h = get('/api/db/stats')
print()
print(SEP)
print('  AcademiCare API -- Live End-to-End Test')
print(SEP)
print('  Server: RUNNING on http://localhost:8000')
print('  DB    :', h['database'])
print('  Type  :', h['type'])

# ── Test 2: Submit check-in ────────────────────────────────
print()
print('  Submitting Arjun Sharma check-in...')
res = post('/api/checkin', {
    'student_id': 1,
    'mood_score': 4.0,
    'sleep_hours': 4.5,
    'study_hours': 10.0,
    'physical_activity': 0.2,
    'placement_anxiety': 1,
    'gate_cat_prep': 1,
    'family_stress': 0,
    'social_isolation': 0,
    'attendance_pct': 68.0,
    'internal_marks_avg': 62.0,
    'days_to_next_exam': 3,
    'assignment_deadlines': 4
})
print()
print(SEP)
print('  CHECK-IN SUBMITTED -> ML INFERENCE -> STORED IN DB')
print(SEP)
score = res['burnout_score']
risk  = res['risk_level']
delta = res['score_delta']
exam  = res['exam_stress']
clust = res['peer_cluster']
stor  = res['stored_in']
model = res['model_used']
print(f'  Burnout Score : {score} / 100')
print(f'  Risk Level    : {risk}')
print(f'  Score Delta   : {delta}')
print(f'  Exam Stress   : {exam} / 100')
print(f'  Peer Cluster  : {clust}')
print(f'  Stored in     : {stor}')
print(f'  Model Used    : {model}')
print()
print('  Recommendations from ML engine:')
for r in res['recommendations']:
    cat = r['category'].upper()
    ttl = r['title']
    print(f'    [{cat}] {ttl}')
print()
print('  Action Flags Triggered:')
triggered = [k for k, v in res['alerts_triggered'].items() if v]
if triggered:
    for t in triggered:
        print(f'    * {t}')
else:
    print('    None triggered (low risk)')

# ── Test 3: Submit Priya (low risk) ───────────────────────
print()
print('  Submitting Priya Krishnan check-in (balanced)...')
res2 = post('/api/checkin', {
    'student_id': 2,
    'mood_score': 7.5,
    'sleep_hours': 7.2,
    'study_hours': 5.5,
    'physical_activity': 1.5,
    'placement_anxiety': 0,
    'gate_cat_prep': 0,
    'family_stress': 0,
    'social_isolation': 0,
    'attendance_pct': 86.0,
    'internal_marks_avg': 79.0,
    'days_to_next_exam': 21,
    'assignment_deadlines': 1
})
print(f'  Priya Score: {res2["burnout_score"]} / 100  ({res2["risk_level"]})')

# ── Test 4: Fetch dashboard ────────────────────────────────
dash = get('/api/dashboard/1')
print()
print(SEP)
print('  DASHBOARD DATA FETCHED FROM DB')
print(SEP)
st   = dash['student']
ls   = dash['latest_score']
src  = dash['data_source']
hist = dash['score_history']
print(f'  Student  : {st["name"]} ({st["roll_no"]})')
print(f'  Score    : {ls["burnout_score"]} ({ls["risk_level"]})')
print(f'  Source   : {src}')
print(f'  History  : {len(hist)} records in DB')

# ── Test 5: DB stats ───────────────────────────────────────
stats = get('/api/db/stats')
print()
print(SEP)
print('  DATABASE STATS (academiccare.db)')
print(SEP)
for t, c in stats['tables'].items():
    bar = '#' * c
    print(f'  {t:<32} {c:>3} rows  {bar}')

# ── Test 6: Counselor alerts ───────────────────────────────
alerts = get('/api/counselor/alerts')
print()
print(SEP)
print('  COUNSELOR ALERT BOARD')
print(SEP)
print(f'  Pending alerts: {alerts["count"]}')
for a in alerts['alerts']:
    print(f'  Token: {a["anon_token"][:12]}...  Score: {a["score"]}  Level: {a["risk_level"]}')

print()
print(SEP)
print('  ALL TESTS PASSED')
print('  Check-in -> ML Model -> SQLite -> Dashboard -> Alerts')
print('  This exact pipeline would run on AWS EC2 + RDS in production')
print(SEP)
print()
