server {
    listen       80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html;
    }

    # Cache static assets (images, CSS, JS)
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
        expires 365d;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
}