# -*- coding: utf-8 -*-
"""
AcademiCare Database Inspector Script
Prints all tables, row counts, and sample records from academiccare.db
"""
import sqlite3
import os
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

DB_PATH = 'academiccare.db'

def inspect_database():
    if not os.path.exists(DB_PATH):
        print(f"Database file '{DB_PATH}' not found in current directory.")
        return

    print("=" * 70)
    print(f" ACADEMICARE DATABASE INSPECTOR ({DB_PATH})")
    print("=" * 70)

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    # Get list of all tables
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [t[0] for t in cur.fetchall() if not t[0].startswith('sqlite_')]

    print(f"\n Found {len(tables)} tables in database:")
    for t in tables:
        cur.execute(f"SELECT COUNT(*) FROM {t}")
        count = cur.fetchone()[0]
        print(f"  • {t:<26} : {count} rows")

    print("\n" + "=" * 70)
    print(" RECENT DATABASE RECORDS BY TABLE")
    print("=" * 70)

    for t in tables:
        print(f"\n Table: {t}")
        cur.execute(f"PRAGMA table_info({t})")
        cols = [c[1] for c in cur.fetchall()]
        print("   Columns:", ", ".join(cols[:8]) + ("..." if len(cols) > 8 else ""))
        
        cur.execute(f"SELECT * FROM {t} ORDER BY rowid DESC LIMIT 3")
        rows = cur.fetchall()
        if not rows:
            print("   (empty table)")
        else:
            for r in rows:
                print("   row ->", r)

    con.close()
    print("\n" + "=" * 70)

if __name__ == '__main__':
    inspect_database()
