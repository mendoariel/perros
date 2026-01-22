FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY mascota-checking.html /usr/share/nginx/html/mascota-checking.html
COPY bg.png /usr/share/nginx/html/bg.png
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
