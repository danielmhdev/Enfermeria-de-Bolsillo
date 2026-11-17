FROM node:22-alpine

WORKDIR /app

# Primero las dependencias: si no cambian, Docker reutiliza este paso.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
