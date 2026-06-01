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

# Informasikan bahwa container ini mendengarkan port 3000
EXPOSE 3000

# Tentukan environment variable bawaan
ENV NODE_ENV=production
ENV APP_ENV=Docker_Production
ENV PORT=3000

# Perintah default untuk menjalankan aplikasi saat container di-start
CMD ["npm", "start"]
