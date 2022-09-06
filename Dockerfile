FROM node:17

# Set up where the app going to look for in linux directory
WORKDIR /usr/src/app

# Copy package.json and pakage-loc.json
COPY package*.json ./

# Installing prettier package
RUN npm install prettier -g

# Run npm install
RUN npm install

# Copy all source files
COPY . .

# Start the server
# RUN node .

# Expose port number of docker image
EXPOSE 6969

# Run node files
CMD [ "node", "." ]
