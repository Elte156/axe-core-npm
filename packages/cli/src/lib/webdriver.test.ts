import 'mocha';
import { assert } from 'chai';
import { startDriver } from './webdriver';
import * as chromedriver from 'chromedriver';
import * as chrome from 'selenium-webdriver/chrome';
import type { Options } from 'selenium-webdriver/chrome';
import * as path from 'path';
import { WebdriverConfigParams } from '../types';
describe('startDriver', () => {
  let config: WebdriverConfigParams;
  let browser: string;
  beforeEach(() => {
    browser = 'chrome-headless';
    config = {
      get browser() {
        return browser;
      }
    };
  });

  afterEach(async () => {
    const service = chrome.getDefaultService();
    if (service.isRunning()) {
      await service.kill();
    }
  });

  it('creates a driver', async () => {
    const driver = await startDriver(config);
    assert.isObject(driver);
    assert.isFunction(driver.manage);
  });

  xit('sets the config.browser as the browser', async () => {
    browser = 'chrome';
    const driver = await startDriver(config);
    const capabilities = await driver.getCapabilities();
    assert.equal(capabilities.get('browserName'), browser);
  });

  it('sets the browser as chrome with chrome-headless', async () => {
    browser = 'chrome-headless';
    const driver = await startDriver(config);
    const capabilities = await driver.getCapabilities();

    assert.equal(capabilities.get('browserName'), 'chrome');
  });

  it('uses the chromedriver path with chrome-headless', async () => {
    browser = 'chrome-headless';
    await startDriver(config);
    const service = chrome.getDefaultService();

    assert.equal((service as any).executable_, chromedriver.path);
  });

  it('uses the passed in chromedriver path with chrome-headless', async () => {
    browser = 'chrome-headless';
    config.chromedriverPath = path.relative(process.cwd(), chromedriver.path);
    await startDriver(config);
    const service = chrome.getDefaultService();

    assert.notEqual(config.chromedriverPath, chromedriver.path);
    assert.equal((service as any).executable_, config.chromedriverPath);
  });

  it('sets the --chrome-options flag with no-sandbox', async () => {
    browser = 'chrome-headless';
    config.chromeOptions = (['--no-sandbox'] as unknown) as Options[];
    await startDriver(config);
    const capabilities = config?.builder?.getCapabilities();
    const chromeOptions = capabilities?.get('chromeOptions');

    assert.isArray(chromeOptions.args);
    assert.deepEqual(chromeOptions.args, ['--no-sandbox']);
  });

  it('sets the --timeout flag', async () => {
    browser = 'chrome-headless';
    config.timeout = 10000;
    const driver = await startDriver(config);
    config.builder;
    const timeoutValue = await driver.manage().getTimeouts();

    assert.isObject(timeoutValue);
    assert.deepEqual(timeoutValue.script, 10000000);
  });
});
