
docker network create web

docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $PWD/traefik.toml:/traefik.toml \
  -v $PWD/traefik_dynamic.toml:/traefik_dynamic.toml \
  -v $PWD/acme.json:/acme.json \
  -p 80:80 \
  -p 443:443 \
  --network web \
  --name traefik \
  traefik:v2.2

fallow this guide
https://www.digitalocean.com/community/tutorials/how-to-use-traefik-v2-as-a-reverse-proxy-for-docker-containers-on-ubuntu-20-04


Docker some command to delete all information

To delete all containers including its volumes use,

docker rm -vf $(docker ps -aq)

remove all images
docker rmi -f $(docker images -aq)

To delete all

docker system prune -a --volumes
