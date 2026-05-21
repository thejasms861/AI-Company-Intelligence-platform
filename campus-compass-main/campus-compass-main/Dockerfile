# /campus-compass-main/campus-compass-main/Dockerfile

# --- Stage 1: Build the React App ---
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy custom Nginx configuration to support React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
