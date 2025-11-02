# Etapa 1: build de la app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Etapa 2: servir con Nginx
FROM nginx:stable-alpine

# Copiar build al servidor web
COPY --from=build /app/dist /usr/share/nginx/html

# 🟢 Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
