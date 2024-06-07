# syntax=docker/dockerfile:1

# # Define build arguments
# ARG NODE_VERSION=18.17.0
# ARG API_KEY
# ARG API_SECRET
# ARG CLOUD_NAME
# ARG DEV_SMTP_EMAIL
# ARG DEV_SMTP_PASSCODE
# ARG MONGO_URI
# ARG STRIPE_SECRET_KEY
# ARG TOKEN_KEY


# # Base image
# FROM node:${NODE_VERSION}-alpine as build

# WORKDIR /app
# # Copy package.json and install dependencies
# COPY package.json ./
# RUN npm install

# # Copy the rest of the source files into the image
# COPY . .
# # RUN npm run build

# # Production image
# FROM nginx:stable-alpine

# # Copy the built application from the previous stage
# # COPY --from=build /app/dist /usr/share/nginx/html

# # Copy the Nginx configuration
# COPY nginx.conf /etc/nginx/nginx.conf

# # Redefine build arguments to make them available for the next stages
# ARG API_KEY
# ARG API_SECRET
# ARG CLOUD_NAME
# ARG DEV_SMTP_EMAIL
# ARG DEV_SMTP_PASSCODE
# ARG MONGO_URI
# ARG STRIPE_SECRET_KEY
# ARG TOKEN_KEY


# # Set environment variables
# ENV API_KEY=$API_KEY \
#     API_SECRET=$API_SECRET \
#     CLOUD_NAME=$CLOUD_NAME \
#     DEV_SMTP_EMAIL=$DEV_SMTP_EMAIL \
#     DEV_SMTP_PASSCODE=$DEV_SMTP_PASSCODE \
#     MONGO_URI=$MONGO_URI \
#     STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
#     TOKEN_KEY=$TOKEN_KEY 
    

# # Use production node environment by default
# ENV NODE_ENV production

# # Expose the port that the application listens on
# # EXPOSE 80
# EXPOSE 4000

# # Start Nginx
# # CMD ["nginx", "-g", "daemon off;"]
# CMD ["node", "index.js"]




# Define build arguments
ARG NODE_VERSION=18.17.0
ARG API_KEY
ARG API_SECRET
ARG CLOUD_NAME
ARG DEV_SMTP_EMAIL
ARG DEV_SMTP_PASSCODE
ARG MONGO_URI
ARG STRIPE_SECRET_KEY
ARG TOKEN_KEY

# Base image for the build stage
FROM node:${NODE_VERSION}-alpine as builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the source files into the image
COPY . .

# Production image
FROM node:${NODE_VERSION}-alpine

# Install Nginx if needed
RUN apk add --no-cache nginx

# Copy the built application from the previous stage
COPY --from=builder /app /app

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set environment variables for the application (repeat ARG and ENV for final stage)
ARG NODE_VERSION=18.17.0
ARG API_KEY
ARG API_SECRET
ARG CLOUD_NAME
ARG DEV_SMTP_EMAIL
ARG DEV_SMTP_PASSCODE
ARG MONGO_URI
ARG STRIPE_SECRET_KEY
ARG TOKEN_KEY

# Set environment variables
ENV API_KEY=$API_KEY \
    API_SECRET=$API_SECRET \
    CLOUD_NAME=$CLOUD_NAME \
    DEV_SMTP_EMAIL=$DEV_SMTP_EMAIL \
    DEV_SMTP_PASSCODE=$DEV_SMTP_PASSCODE \
    MONGO_URI=$MONGO_URI \
    STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
    TOKEN_KEY=$TOKEN_KEY

# Use production node environment by default
ENV NODE_ENV=production

# Expose the ports that your application and Nginx will listen on
EXPOSE 80 443 4000

# Start Nginx and your Node.js application
CMD ["sh", "-c", "nginx -g 'daemon off;' & node /app/index.js"]