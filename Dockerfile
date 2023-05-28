FROM node:20-alpine as base
ENV NODE_ENV production

FROM base as dependencies
WORKDIR /fuel
ADD package.json package-lock.json ./
RUN npm install --include=dev

FROM base as production-dependencies
WORKDIR /fuel
COPY --from=dependencies /fuel/node_modules /fuel/node_modules
ADD package.json package-lock.json ./
RUN npm prune --omit=dev

FROM base as build
WORKDIR /fuel
COPY --from=dependencies /fuel/node_modules /fuel/node_modules
ADD . .
RUN npm run build

FROM base
WORKDIR /fuel
COPY --from=production-dependencies /fuel/node_modules /fuel/node_modules
COPY --from=build /fuel/build /fuel/build
ADD package.json .

CMD ["npm", "start"]