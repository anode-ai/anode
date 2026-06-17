import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';

@Injectable()
export class CrawlerService {
  async crawl(url: string) {
    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
      });

      await page.waitForSelector('body', {
        timeout: 10000,
    });

      const title = await page.title();

      const links = await page.$$eval('a', (elements) =>
        elements
          .map((el) => (el as HTMLAnchorElement).href)
          .filter(Boolean),
      );

      const text = await page.locator('body').innerText();

      return {
        title,
        links,
        text,
      };
    } finally {
      await browser.close();
    }
  }
}