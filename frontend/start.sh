#!/bin/sh
envsubst '${BACKEND_URL}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf
nginx -g "daemon off;"
