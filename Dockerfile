# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code to container
COPY . .

# Expose port application run (example 3000)
EXPOSE 3000

# Command run application when container start
CMD ["npm", "start"]
