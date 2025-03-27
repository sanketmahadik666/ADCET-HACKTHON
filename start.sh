#!/bin/sh

# Start Nginx
nginx

# Create logs directory
mkdir -p logs

# Start PM2
pm2 start ecosystem.config.js

# Keep container running
tail -f /dev/null 