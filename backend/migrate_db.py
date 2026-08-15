import sqlite3
import uuid


def migrate():
    db_path = 'backend/callers.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Check if caller_profiles exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='caller_profiles'")
    if cursor.fetchone():
        print("Table 'caller_profiles' already exists. Skipping migration.")
        return

    print("Creating caller_profiles table...")
    cursor.execute("""
        CREATE TABLE caller_profiles (
            profile_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            normalized_name TEXT NOT NULL,
            language_preference TEXT,
            facts TEXT,
            last_interaction TIMESTAMP,
            UNIQUE(user_id, normalized_name)
        )
    """)

    # Check if old callers table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='callers'")
    if cursor.fetchone():
        print("Migrating existing data from 'callers'...")
        cursor.execute("SELECT user_id, name, language_preference, facts, last_interaction FROM callers")
        rows = cursor.fetchall()

        for row in rows:
            user_id, name, lang, facts, last_interaction = row
            # Some names might be None in older tests, fallback to 'Unknown'
            actual_name = name if name else "Unknown"
            normalized_name = actual_name.strip().lower()
            profile_id = f"profile_{uuid.uuid4().hex[:8]}"

            try:
                cursor.execute("""
                    INSERT INTO caller_profiles 
                    (profile_id, user_id, name, normalized_name, language_preference, facts, last_interaction)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (profile_id, user_id, actual_name, normalized_name, lang, facts, last_interaction))
            except sqlite3.IntegrityError:
                print(f"Skipping duplicate/invalid record for user {user_id} and name {actual_name}")

        # We can rename the old table or drop it, let's just rename it to preserve it just in case
        cursor.execute("ALTER TABLE callers RENAME TO callers_deprecated")
        print("Old 'callers' table renamed to 'callers_deprecated'.")
    else:
        print("No 'callers' table found to migrate.")

    conn.commit()
    conn.close()
    print("Migration completed successfully.")

if __name__ == "__main__":
    migrate()
