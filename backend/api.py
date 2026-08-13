import sqlite3
import aiohttp.web
import asyncio
import os

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
        return aiohttp.web.json_response({
            "totalCalls": stats["successful"] + stats["failed"],
            "successfulCalls": stats["successful"],
            "failedCalls": stats["failed"]
        }, headers={"Access-Control-Allow-Origin": "*"})
    except sqlite3.OperationalError:
        # Table might not exist yet
        return aiohttp.web.json_response({
            "totalCalls": 0,
            "successfulCalls": 0,
            "failedCalls": 0
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
