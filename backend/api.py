import os
import sqlite3

import aiohttp.web

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "callers.db"))

async def handle_analytics(request):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT outcome, COUNT(*) as count FROM call_analytics GROUP BY outcome")
        rows = cursor.fetchall()
        stats = {"successful": 0, "failed": 0}
        for row in rows:
            stats[row[0]] = row[1]

        cursor.execute("SELECT outcome, created_at FROM call_analytics ORDER BY created_at DESC LIMIT 5")
        recent_rows = cursor.fetchall()
        recent_calls = []
        for row in recent_rows:
            outcome = row[0]
            desc = "User request resolved or human assistance successfully escalated" if outcome == "successful" else "User request not resolved before the call ended"
            recent_calls.append({
                "outcome": outcome,
                "createdAt": row[1],
                "description": desc
            })

        return aiohttp.web.json_response({
            "totalCalls": stats["successful"] + stats["failed"],
            "successfulCalls": stats["successful"],
            "failedCalls": stats["failed"],
            "recentCalls": recent_calls
        }, headers={"Access-Control-Allow-Origin": "*"})
    except sqlite3.OperationalError:
        # Table might not exist yet
        return aiohttp.web.json_response({
            "totalCalls": 0,
            "successfulCalls": 0,
            "failedCalls": 0,
            "recentCalls": []
        }, headers={"Access-Control-Allow-Origin": "*"})
    finally:
        conn.close()

async def handle_options(request):
    return aiohttp.web.Response(headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    })

app = aiohttp.web.Application()
app.router.add_get('/api/analytics', handle_analytics)
app.router.add_options('/api/analytics', handle_options)

if __name__ == "__main__":
    aiohttp.web.run_app(app, port=8000)
