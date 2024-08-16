FROM node:22

# Set up where the app is going to be in the Linux directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Installing prettier package globally
RUN npm install prettier -g

# Install dependencies
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node

# Copy all source files
COPY . .

# Expose port number of docker image
EXPOSE 6969

# Run ts-node instead of node to run the TypeScript file
CMD [ "ts-node", "index.tsx" ]
