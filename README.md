# 🐳 Docker Learning Dashboard (VPS Deployment Guide)

Panduan deployment dan pengujian aplikasi dashboard interaktif "Learn Docker" pada server VPS (Virtual Private Server) Anda yang telah terinstall Docker.

---

## 🚀 Langkah 1: Transfer File Proyek ke VPS

Pilih salah satu metode berikut untuk mengirimkan folder proyek ini (`learndocker`) ke VPS Anda:

### Opsi A: Menggunakan Git (Paling Direkomendasikan)
1. Push project ini ke repository private/public Anda (misal GitHub/GitLab).
2. SSH ke VPS Anda:
   ```bash
   ssh username@ip_vps_anda
   ```
3. Clone repository tersebut di VPS:
   ```bash
   git clone <url_repository_anda>
   cd learndocker
   ```

### Opsi B: Menggunakan SCP (Secure Copy) dari Komputer Lokal
Jalankan perintah ini di Command Prompt/Terminal komputer lokal Anda (pada direktori proyek):
```bash
scp -r ../learndocker username@ip_vps_anda:/home/username/
```
Setelah transfer selesai, SSH ke VPS Anda dan masuk ke folder tersebut:
```bash
ssh username@ip_vps_anda
cd /home/username/learndocker
```

---

## 📦 Langkah 2: Menjalankan Aplikasi di VPS dengan Docker

Setelah masuk ke direktori proyek di VPS, jalankan aplikasi menggunakan salah satu cara berikut:

### Metode 1: Menggunakan Docker Compose (Sangat Mudah)
Jalankan perintah ini untuk membangun image dan menjalankan kontainer di background:
```bash
docker compose up -d
```

### Metode 2: Menggunakan Docker CLI (Standard)
1. **Build image**:
   ```bash
   docker build -t learndocker-app .
   ```
2. **Jalankan container**:
   ```bash
   docker run -d -p 3000:3000 --restart unless-stopped --name docker-dashboard learndocker-app
   ```

---

## 🌐 Langkah 3: Mengakses Aplikasi dari Browser

Buka browser Anda dan akses aplikasi menggunakan alamat IP VPS Anda:
```
http://<IP_VPS_ANDA>:3000
```
*(Contoh: `http://192.168.1.100:3000`)*

### ⚠️ Troubleshooting (Jika Halaman Tidak Bisa Diakses):
Jika halaman tidak dapat dibuka, kemungkinan besar port `3000` masih diblokir oleh firewall VPS Anda.

1. **Jika VPS menggunakan UFW (Ubuntu/Debian)**, buka port 3000 dengan perintah berikut di VPS:
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw reload
   ```
2. **Jika menggunakan Cloud Provider (AWS, Alibaba Cloud, GCP, DigitalOcean, dll.)**:
   Pastikan Anda telah menambahkan **Security Group / Firewall Rule** baru di panel penyedia VPS untuk mengizinkan traffic masuk (Inbound Rule) ke **Port 3000** (TCP).

---

## 🛠️ Perintah Berguna Lainnya di VPS

* **Melihat status kontainer**:
  ```bash
  docker ps
  ```
* **Melihat log aplikasi (untuk debugging)**:
  ```bash
  docker logs -f docker-learning-dashboard
  ```
* **Menghentikan aplikasi**:
  * Jika menggunakan Docker Compose: `docker compose down`
  * Jika menggunakan Docker CLI: `docker stop docker-dashboard`
