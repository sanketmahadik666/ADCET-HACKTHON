# Build stage for Node.js application
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

# Install PM2 globally
RUN npm install -g pm2

# Install Nginx
RUN apk add --no-cache nginx

# Create app directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder /app .

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy PM2 configuration
COPY ecosystem.config.js .

# Copy static files to Nginx
COPY public /usr/share/nginx/html

# Expose ports
EXPOSE 80
EXPOSE 443

# Start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV MONGODB_URI=mongodb://mongodb:27017/toilet-review
ENV JWT_SECRET=your_jwt_secret_here

# Start the application
CMD ["/start.sh"] 