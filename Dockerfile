# Base image with Node.js
FROM node:20.18-slim

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the app source code
COPY . .

# Build the app (if necessary)
RUN npm run build

# Expose port (optional)
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
