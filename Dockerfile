FROM node:8.9
COPY build /build 
COPY node_modules /node_modules
COPY package.json /package.json
CMD cd / && npm run startServer