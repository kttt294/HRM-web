# Build Stage
FROM node:18-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine as production-stage
# Copy build artifacts từ build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy cấu hình nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 mặc định của Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
