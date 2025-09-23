import dotenv from 'dotenv'
import fs from 'fs'
import { Builder } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'

dotenv.config()

export class Browser {
  constructor() {
    this.driver = null
  }

  async init() {
    const options = new chrome.Options()
    if (process.env.HEADLESS === 'true') {
      options.addArguments('--headless')
    }
    options.addArguments('--no-sandbox')
    options.addArguments('--disable-dev-shm-usage')
    options.addArguments('--password-store=basic')

    // #autofill-show-bubbles-based-on-priorities

    this.driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  }

  get getCurrentUrl() {
    return this.driver.getCurrentUrl.bind(this.driver)
  }

  get open() {
    return this.driver.get.bind(this.driver)
  }

  get findElement() {
    return this.driver.findElement.bind(this.driver)
  }

  get findElements() {
    return this.driver.findElements.bind(this.driver)
  }

  get wait() {
    return this.driver.wait.bind(this.driver)
  }
  
  get sleep() {
    return this.driver.sleep.bind(this.driver)
  }

  async quit() {
    if (this.driver) {
        await this.driver.quit()
        this.driver = null
    }
  }

  async takeScreenshot(filename) {
    const image = await this.driver.takeScreenshot()
    fs.writeFileSync(filename, image, 'base64')
    console.log(`Screenshot saved to ${filename}`)
  }

  async saveHTML(filename) {
    const html = await this.driver.getPageSource()
    fs.writeFileSync(filename, html)
    console.log(`HTML saved to ${filename}`)
  }
}