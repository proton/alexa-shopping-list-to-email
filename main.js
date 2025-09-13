import fs from 'fs'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { Builder, By } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'

dotenv.config()

const SHOPPING_LIST_URL = 'https://www.amazon.com/alexaquantum/sp/alexaShoppingList'

const AMAZON_EMAIL    = process.env.AMAZON_EMAIL
const AMAZON_PASSWORD = process.env.AMAZON_PASSWORD

const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL

const SMTP_USER   = process.env.SMTP_USER
const SMTP_PASS   = process.env.SMTP_PASS
const SMTP_HOST   = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT   = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465
const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true

const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
})

async function sendEmail(subject, body) {
  return mailer.sendMail({
    from:    SMTP_USER,
    to:      RECIPIENT_EMAIL,
    subject: subject,
    text:    body,
  })
}

async function createBrowser() {
  let options = new chrome.Options()
  options.addArguments('--headless')
  options.addArguments('--no-sandbox')
  options.addArguments('--disable-dev-shm-usage')

  return await new Builder().forBrowser('chrome').setChromeOptions(options).build()
}

async function retry(fn, retries = 50, delay = 100) {
  for (let attempt = 1; attempt <= retries; ++attempt) {
    try {
      const result = await fn()
      return result
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      await browser.sleep(delay)
    }
  }
}

async function main() {
  let browser = await createBrowser()

  try {
    await browser.get(SHOPPING_LIST_URL)
    await browser.sleep(3000)

    // Authentication
    if ((await browser.getCurrentUrl()).includes('signin')) {
      console.log('Unauthenticated, logging in...')

      await retry(async () => {
        await browser.findElement(By.id('ap_email_login')).sendKeys(AMAZON_EMAIL)
        await browser.findElement(By.css("#continue input.a-button-input")).click()
      })
      await retry(async () => {
        await browser.findElement(By.id('ap_password')).sendKeys(AMAZON_PASSWORD)
        await browser.findElement(By.css("#auth-signin-button input.a-button-input")).click()
      })

      await browser.sleep(1000)
      await browser.get(SHOPPING_LIST_URL)
      await browser.sleep(3000)
    }

    console.log('Loading shopping list...')
    // Get all list items
    const items = await retry(async () => {
      return await browser.findElements(By.css('.virtual-list .inner'))
    })
    console.log(`Found ${items.length} items in the shopping list.`)

    for (let item of items) {
      try {
        let text = await item.findElement(By.css('.item-title')).getText()
        text = text?.trim()
        if (!text) {
          continue
        }

        console.log('Processing item:', text)
        await sendEmail(text, 'Created by Alexa Shopping List to Email script')
        
        let checkbox = await item.findElement(By.css('.checkBox input'))
        await checkbox.click()
      } catch (error) {
        console.error('Error processing item:', error)
      }
    }
  } catch (error) {
    console.error('Error in main process:', error)
    await browser.takeScreenshot().then(
      data => fs.writeFileSync('tmp/debug.png', data, 'base64')
    )
  } finally {
    await browser.quit()
  }
}

main()
