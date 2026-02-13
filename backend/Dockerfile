# Sử dụng Node.js image chính thức
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ code nguồn
COPY . .

# Expose port mà app chạy (cần khớp với PORT trong .env hoặc mặc định)
EXPOSE 5001

# Chạy ứng dụng
CMD ["npm", "start"]
