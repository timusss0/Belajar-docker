# === STAGE 1: Build Aplikasi dengan Node.js ===
FROM node:18-alpine AS builder

WORKDIR /app

# Salin package.json dan install SEMUA dependensi (termasuk devDependencies untuk build)
COPY package*.json ./
RUN npm ci

# Salin seluruh file source code ke /app
COPY . .

# Jalankan perintah build (menghasilkan folder dist atau build)
RUN npm run build

# === STAGE 2: Jalankan dengan Nginx ===
FROM nginx:alpine

# Salin hasil build dari stage 'builder' (sesuaikan 'dist' atau 'build' dengan framework Anda)
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (bawaan Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]