FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY src ./src/

RUN npm install
RUN npx prisma generate
RUN npx tsc -p tsconfig.build.json --noEmitOnError false

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]