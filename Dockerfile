# Gunakan base image Nginx versi Alpine yang sangat ringan
FROM nginx:alpine

# Salin file static HTML, CSS, dan JS ke folder default Nginx
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Informasikan port default Nginx (port 80)
EXPOSE 80

# Nginx akan otomatis berjalan secara default, tidak perlu CMD khusus