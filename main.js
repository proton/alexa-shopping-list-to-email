import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { Builder, By } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'

dotenv.config()

const AMAZON_EMAIL    = process.env.AMAZON_EMAIL
const AMAZON_PASSWORD = process.env.AMAZON_PASSWORD
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL

const SHOPPING_LIST_URL = 'https://www.amazon.com/alexaquantum/sp/alexaShoppingList'

const mailer = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path:    '/usr/sbin/sendmail',
})

async function sendEmail(subject, body) {
  await mailer.sendMail({
    from:    "Amazon Shopping List",
    to:      RECIPIENT_EMAIL,
    subject: subject,
    text:    body,
  })
}

async function main() {
  let options = new chrome.Options()
  // options.addArguments('--headless')
  options.addArguments('--no-sandbox')
  options.addArguments('--disable-dev-shm-usage')

  let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  try {
    await driver.get(SHOPPING_LIST_URL)
    await driver.sleep(3000)

    // Authentication
    if ((await driver.getCurrentUrl()).includes('signin')) {
      await driver.findElement(By.id('ap_email_login')).sendKeys(AMAZON_EMAIL)
      await driver.findElement(By.css("#continue input.a-button-input")).click()
      await driver.sleep(2000)
      await driver.findElement(By.id('ap_password')).sendKeys(AMAZON_PASSWORD)
      await driver.findElement(By.css("#auth-signin-button input.a-button-input")).click()
      await driver.sleep(5000)
      await driver.get(SHOPPING_LIST_URL)
      await driver.sleep(3000)
    }

    // Get all list items
    let items = await driver.findElements(By.css('.virtual-list .inner'))
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
        await checkbox.click()
      } catch (e) {
        console.error('Error processing item:', e)
      }
    }
  } finally {
    await driver.quit()
  }
}

main()
