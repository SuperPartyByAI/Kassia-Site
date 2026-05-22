#!/bin/bash
export SSHPASS='4NL7FnKaPh3X'
IP="89.167.115.150"
TARGET="/opt/kassia-site"
SRC="."

echo "1. Creare folder pe server și sincronizare cod (fără node_modules/dist)..."
sshpass -e ssh -o StrictHostKeyChecking=no root@$IP "mkdir -p $TARGET"
sshpass -e rsync -avz --exclude 'node_modules' --exclude '.astro' --exclude 'dist' -e "ssh -o StrictHostKeyChecking=no" ./$SRC/ root@$IP:$TARGET/

echo "Copiere variabile de mediu (.env.local) pe server..."
sshpass -e scp -o StrictHostKeyChecking=no ./$SRC/.env.local root@$IP:$TARGET/.env
sshpass -e scp -o StrictHostKeyChecking=no ./$SRC/.env.local root@$IP:$TARGET/.env.local

echo "2. Reconstruire aplicație și repornire pe server..."
sshpass -e ssh -o StrictHostKeyChecking=no root@$IP << 'EOF'
  cd /opt/kassia-site
  
  # Asigură folosirea Node.js 22 (necesar pentru Astro)
  source /root/.nvm/nvm.sh
  nvm install 22
  nvm use 22
  
  echo "Instalare dependințe pe server..."
  npm install
  echo "Construire versiune de producție (Astro build)..."
  npm run build
  
  # Configurare pentru rulare continuă cu PM2 (Port 3050)
  cat << 'ECO' > ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'kassia-site',
      script: './dist/server/entry.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3050,
        HOST: '127.0.0.1'
      }
    }
  ]
};
ECO

  # Pornire / Repornire serviciu
  pm2 describe kassia-site > /dev/null
  if [ $? -eq 0 ]; then
    pm2 restart kassia-site --update-env
  else
    pm2 start ecosystem.config.cjs
  fi
  pm2 save
  
  # Configurare Nginx pentru domeniul kassya.ro
  echo "Configurare NGINX pentru kassya.ro..."
  cat << 'NGINX' > /etc/nginx/sites-available/kassya.ro.conf
server {
    listen 80;
    server_name kassya.ro www.kassya.ro;

    location / {
        proxy_pass http://127.0.0.1:3050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX
  
  ln -sf /etc/nginx/sites-available/kassya.ro.conf /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
EOF

echo "✅ Gata! Site-ul a fost lansat. Dacă domeniul kassya.ro este setat către acest server (89.167.115.150), site-ul este online!"
