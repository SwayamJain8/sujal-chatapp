FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

COPY . .

# Build TypeScript
RUN tsc

EXPOSE 5001

CMD ["npm", "run", "dev"]