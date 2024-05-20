# syntax=docker/dockerfile:1

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


# Base image
FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app/

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the source files into the image
COPY . .

# Redefine build arguments to make them available for the next stages
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
ENV NODE_ENV production

# Expose the port that the application listens on
EXPOSE 4000

# Run the application
CMD ["npm", "start"]
