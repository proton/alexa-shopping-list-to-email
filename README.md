
# Alexa Shopping List to Email 

This app logs into your Amazon Alexa shopping list, sends each item to a specified email, and deletes it from the list. 

I created it to syncronize my Amazon Alexa shopping list with TickTick Todo list.

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

## Notes
- The script uses Selenium WebDriver and Chromium in headless mode.
- The selectors for shopping list items and delete buttons may change if Amazon updates their UI.
