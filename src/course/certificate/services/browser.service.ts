import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private browser: Browser | null = null;
  private initializing: Promise<Browser> | null = null;

  async getInstance(): Promise<Browser> {
    if (this.browser) return this.browser;

    if (!this.initializing) {
      this.initializing = puppeteer
        .launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        })
        .then((browser) => {
          this.browser = browser;

          this.browser.on('disconnected', () => {
            this.browser = null;
            this.initializing = null;
          });

          return browser;
        });
    }

    return this.initializing;
  }

  async onModuleDestroy() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.initializing = null;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
