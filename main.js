import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import { Builder, By } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'

dotenv.config()

const AMAZON_EMAIL    = process.env.AMAZON_EMAIL
const AMAZON_PASSWORD = process.env.AMAZON_PASSWORD
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL
const SMTP_SERVER     = process.env.SMTP_SERVER || 'smtp.gmail.com'
const SMTP_PORT       = process.env.SMTP_PORT || 587
const SMTP_USER       = process.env.SMTP_USER
const SMTP_PASS       = process.env.SMTP_PASS

const SHOPPING_LIST_URL = 'https://www.amazon.com/alexaquantum/sp/alexaShoppingList'

async function sendEmail(subject, body, toEmail) {
  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
  await transporter.sendMail({
    from: SMTP_USER,
    to: toEmail,
    subject: subject,
    text: body,
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
        // await sendEmail('Amazon Shopping List Item', text, RECIPIENT_EMAIL)
        
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
