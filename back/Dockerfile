FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY src ./src/
COPY nest-cli.json ./

RUN npm install

RUN npx prisma generate

RUN ./node_modules/.bin/tsc -p tsconfig.build.json --noEmitOnError false || true

RUN ls -la /app/dist || echo "dist empty, trying nest build"

RUN ./node_modules/.bin/nest build || true

RUN ls -la /app/dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]