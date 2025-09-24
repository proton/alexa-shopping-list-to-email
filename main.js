import dotenv from 'dotenv'

import { By, until } from 'selenium-webdriver'
import { Browser } from './browser.js'
import { sendEmail } from './mailer.js'

dotenv.config()

const DEFAULT_TIMEOUT = 10000

const SHOPPING_LIST_URL = 'https://www.amazon.com/alexaquantum/sp/alexaShoppingList'

const AMAZON_EMAIL    = process.env.AMAZON_EMAIL
const AMAZON_PASSWORD = process.env.AMAZON_PASSWORD

async function login(browser) {
  await browser.wait(until.elementLocated(By.id('ap_email_login')), DEFAULT_TIMEOUT)
  await browser.findElement(By.id('ap_email_login')).sendKeys(AMAZON_EMAIL)
  await browser.findElement(By.css("#continue input.a-button-input")).click()

  await browser.wait(until.elementLocated(By.id('ap_password')), DEFAULT_TIMEOUT)
  await browser.findElement(By.id('ap_password')).sendKeys(AMAZON_PASSWORD)

  await browser.findElement(By.css("#auth-signin-button input.a-button-input")).click()

  await browser.sleep(5000) // just in case

  await browser.wait(until.elementLocated(By.id('root')), DEFAULT_TIMEOUT)
}

async function processItem(item) {
  try {
    let text = await item.findElement(By.css('.item-title')).getText()
    text = text?.trim()
    if (!text) {
      return
    }

    console.log('Processing item:', text)
    await sendEmail(text, 'Created by Alexa Shopping List to Email script')

    await (await item.findElement(By.css('.checkBox input'))).click()
  } catch (error) {
    console.error('Error processing item:', error)
    await browser.saveHTML('tmp/process_item_error.html')
    await browser.takeScreenshot('tmp/process_item_error.png')
  }
}

async function main() {
  console.log('Starting browser...')
  const browser = new Browser()
  await browser.init()

  try {
    while (true) {
      console.log('Loading shopping list...')

      await browser.open(SHOPPING_LIST_URL)
      try {
        await browser.wait(until.elementLocated(By.css('#root .list-header .add-text')), DEFAULT_TIMEOUT)
      } catch (error) {
        if ((await browser.getCurrentUrl()).includes('signin')) {
          console.log('Unauthenticated, logging in...')
          await login(browser)
          continue
        }
        throw error
      }

      let item = null
      try {
        await browser.wait(until.elementLocated(By.css('.virtual-list .inner')), DEFAULT_TIMEOUT)
        const items = await browser.findElements(By.css('.virtual-list .inner'))
        console.log(`Found ${items.length} items in the shopping list.`)

        item = items[0]
      } catch (error) {
        console.log('No items found, retrying in 100 seconds...')
        await browser.sleep(100000)
      }
      await processItem(item)
      await browser.sleep(1000)
    }

  } catch (error) {
    console.error('Error in main process:', error)
    await browser.saveHTML('tmp/debug.html')
    await browser.takeScreenshot('tmp/debug.png')
  } finally {
    await browser.quit()
  }
}

main()
