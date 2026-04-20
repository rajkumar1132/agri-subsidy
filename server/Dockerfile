# Base image optimized for production Node.js
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate Prisma engine
RUN npx prisma generate

# Make our entrypoint script executable
RUN chmod +x entrypoint.sh

# Expose the API port
EXPOSE 3000

# Use the custom entrypoint script to handle startup DB migrations
ENTRYPOINT ["/app/entrypoint.sh"]
