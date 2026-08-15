import sqlite3

conn=sqlite3.connect('callers.db')
print(conn.execute('SELECT sql FROM sqlite_master WHERE type=\"table\" AND name=\"call_analytics\"').fetchone()[0])
