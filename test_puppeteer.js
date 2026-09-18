import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(`
    <style>.test { color: oklch(0.6 0.1 250); }</style>
    <div class="test" id="test">Hello</div>
  `);
  const color = await page.evaluate(() => {
    return window.getComputedStyle(document.getElementById('test')).color;
  });
  console.log('Computed color:', color);
  await browser.close();
})();
