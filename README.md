
# Alexa Shopping List to Email (Node.js)

This app logs into your Amazon Alexa shopping list, sends each item to a specified email, and deletes it from the list. Now implemented in JavaScript (Node.js).

## Usage

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```sh
   cp .env.example .env
   # Edit .env with your data
   ```
2. Build the Docker image:
   ```sh
   docker build -t alexa-shopping-list-to-email .
   ```
3. Run the container (pass env file):
   ```sh
   docker run --env-file .env --rm alexa-shopping-list-to-email
   ```

## Requirements
- Amazon account with Alexa shopping list
- Email account with SMTP access (Gmail, etc.)

## Notes
- The script uses Selenium WebDriver and Chromium in headless mode.
- For Gmail, you may need an App Password (not your main password).
- The selectors for shopping list items and delete buttons may change if Amazon updates their UI.
- Node.js 24 is used in the Docker image.
