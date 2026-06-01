# 🐳 Docker Learning Dashboard (Static Nginx VPS)

Panduan deployment dan pengujian aplikasi dashboard interaktif "Learn Docker" versi **Static HTML/CSS/JS** menggunakan web server **Nginx** di VPS (Virtual Private Server) Anda.

---

## 🚀 Langkah 1: Transfer File Proyek ke VPS

Kirim seluruh file di folder proyek ini (`learndocker`) ke VPS Anda:

### Opsi A: Menggunakan Git (Paling Direkomendasikan)
1. Push project ini ke repository Anda (misal GitHub/GitLab).
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

## 📦 Langkah 2: Menjalankan Nginx Container di VPS

Setelah masuk ke direktori proyek di VPS, jalankan container dengan salah satu metode berikut:

### Metode 1: Menggunakan Docker Compose (Sangat Mudah)
Jalankan perintah ini untuk membangun image static dan menjalankan kontainer di background:
```bash
docker compose up -d
```

### Metode 2: Menggunakan Docker CLI (Standard)
1. **Build image**:
   ```bash
   docker build -t learndocker-static .
   ```
2. **Jalankan container**:
   ```bash
   docker run -d -p 3000:80 --restart unless-stopped --name docker-dashboard learndocker-static
   ```
   > **Penjelasan**: Port `3000` di VPS akan dipetakan ke port `80` (port standar web server Nginx) di dalam container.

---

## 🌐 Langkah 3: Mengakses Aplikasi dari Browser

Buka browser Anda dan akses aplikasi menggunakan alamat IP VPS Anda:
```
http://<IP_VPS_ANDA>:3000
```
*(Contoh: `http://192.168.1.100:3000`)*

### ⚠️ Troubleshooting (Jika Halaman Tidak Bisa Diakses):
Jika halaman tidak dapat dibuka, kemungkinan besar port `3000` masih diblokir oleh firewall VPS Anda.

1. **UFW Firewall (Ubuntu/Debian)**:
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw reload
   ```
2. **Security Group (Panel Cloud AWS/GCP/Alibaba/DigitalOcean)**:
   Tambahkan **Inbound Rule** baru di panel manajemen VPS Anda untuk membuka **Port 3000** (TCP) untuk publik.

---

## 🛠️ Perintah Berguna Lainnya di VPS

* **Melihat status kontainer**:
  ```bash
  docker ps
  ```
* **Melihat log aktivitas Nginx**:
  ```bash
  docker logs -f docker-learning-dashboard
  ```
* **Menghentikan kontainer**:
  * Jika menggunakan Docker Compose: `docker compose down`
  * Jika menggunakan Docker CLI: `docker stop docker-dashboard`
