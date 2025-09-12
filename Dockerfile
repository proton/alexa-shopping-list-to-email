
FROM node:24-slim

WORKDIR /app

RUN apt-get update && \
	apt-get install -y chromium chromium-driver && \
	rm -rf /var/lib/apt/lists/*

COPY package.json .
RUN npm install

COPY main.js .

ENV PATH="/usr/lib/chromium:/usr/lib/chromium-browser:$PATH"

CMD ["node", "main.js"]
