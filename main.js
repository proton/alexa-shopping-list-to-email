import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { Builder, By } from 'selenium-webbrowser'
import chrome from 'selenium-webbrowser/chrome.js'

dotenv.config()

const AMAZON_EMAIL    = process.env.AMAZON_EMAIL
const AMAZON_PASSWORD = process.env.AMAZON_PASSWORD
const FROM_EMAIL      = process.env.FROM_EMAIL
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL

const SHOPPING_LIST_URL = 'https://www.amazon.com/alexaquantum/sp/alexaShoppingList'

const mailer = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path:    '/usr/sbin/sendmail',
})

async function sendEmail(subject, body) {
  return mailer.sendMail({
    from:    FROM_EMAIL,
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

async function main() {
  let browser = await createBrowser()

  try {
    await browser.get(SHOPPING_LIST_URL)
    await browser.sleep(3000)

    // Authentication
    if ((await browser.getCurrentUrl()).includes('signin')) {
      await browser.findElement(By.id('ap_email_login')).sendKeys(AMAZON_EMAIL)
      await browser.findElement(By.css("#continue input.a-button-input")).click()
      await browser.sleep(2000)
      await browser.findElement(By.id('ap_password')).sendKeys(AMAZON_PASSWORD)
      await browser.findElement(By.css("#auth-signin-button input.a-button-input")).click()
      await browser.sleep(5000)
      await browser.get(SHOPPING_LIST_URL)
      await browser.sleep(3000)
    }

    // Get all list items
    let items = await browser.findElements(By.css('.virtual-list .inner'))
    for (let item of items) {
      try {
        let text = await item.findElement(By.css('.item-title')).getText()
        text = text?.trim()
        if (!text) {
          continue
        }
        console.log('Processing item:', text)
        await sendEmail('Amazon Shopping List Item', text)
        
        let checkbox = await item.findElement(By.css('.checkBox input'))
        // await checkbox.click()
      } catch (e) {
        console.error('Error processing item:', e)
      }
    }
  } finally {
    await browser.quit()
  }
}

main()
