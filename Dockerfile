FROM node:14.15.2 as build
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
RUN yarn
COPY src ./src/
RUN yarn build

FROM node:14.15.2 as main
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
ENV NODE_ENV=production
RUN yarn
COPY --from=build /usr/src/app/build/ ./build/
RUN ls
EXPOSE 3000
CMD [ "yarn", "start:prod" ]