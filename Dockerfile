  # Gunakan base image Node.js versi 18 yang ringan (alpine)
  FROM node:18-alpine

  # Tentukan direktori kerja di dalam container
  WORKDIR /app

  # Salin package.json dan package-lock.json (jika ada) untuk install dependensi
  # Ini mempermudah caching layer Docker agar proses build lebih cepat berikutnya
  COPY package*.json ./

  # Install dependensi produksi (tanpa devDependencies seperti nodemon)
  RUN npm ci --only=production

  # Salin seluruh sisa file kode aplikasi ke dalam container
  COPY . .

  # Informasikan bahwa container ini mendengarkan port 3000# === STAGE 1: Build Aplikasi dengan Node.js ===
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install semua dependensi untuk build
RUN npm ci

COPY . .
# Jalankan perintah build (ganti sesuai script di package.json Anda, misal: npm run build)
RUN npm run build

# === STAGE 2: Jalankan dengan Nginx ===
FROM nginx:alpine

# Salin hasil build dari stage 'builder' ke direktori web Nginx
# Sesuaikan folder 'dist' atau 'build' dengan hasil build aplikasi Anda
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (port bawaan Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
  EXPOSE 3000

  # Tentukan environment variable bawaan
  ENV NODE_ENV=production
  ENV APP_ENV=Docker_Production
  ENV PORT=3000

  # Perintah default untuk menjalankan aplikasi saat container di-start
  CMD ["npm", "start"]
