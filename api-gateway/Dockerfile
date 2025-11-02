# Imagen base
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 5000

# Comando de arranque
CMD ["npm", "start"]
