# Use the official lightweight Nginx Alpine image
FROM nginx:alpine

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy static files (HTML, CSS, JS, images)
COPY ./ /usr/share/nginx/html/

# (Optional) Custom Nginx configuration for better caching/security
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (HTTP)
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]