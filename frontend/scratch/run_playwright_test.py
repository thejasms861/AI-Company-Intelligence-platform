import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Listen for console events
        errors = []
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}") if msg.type in ["error", "warning"] else None)
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        
        print("Navigating to http://localhost:3000/explore...")
        await page.goto("http://localhost:3000/explore")
        await asyncio.sleep(5)
        print("Done waiting.")
        await browser.close()

asyncio.run(main())
