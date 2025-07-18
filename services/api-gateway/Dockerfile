FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install --ignore-scripts --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"] 