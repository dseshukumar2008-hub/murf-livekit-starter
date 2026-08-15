import sqlite3

db_path = 'backend/callers.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Find Ramesh
c.execute("SELECT * FROM callers WHERE LOWER(name) = 'ramesh'")
records = c.fetchall()

if not records:
    print("No records found for Ramesh.")
else:
    for r in records:
        print(f"FOUND RECORD: user_id={r[0]}, name={r[1]}, facts={r[3]}")

    # Delete Ramesh
    c.execute("DELETE FROM callers WHERE LOWER(name) = 'ramesh'")
    conn.commit()
    print("Ramesh records deleted.")

    # Verify
    c.execute("SELECT * FROM callers WHERE LOWER(name) = 'ramesh'")
    verify = c.fetchall()
    print(f"Verification after deletion (should be empty): {verify}")

conn.close()
