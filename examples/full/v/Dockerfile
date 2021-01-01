FROM thevlang/vlang-alpine AS build

WORKDIR /app

COPY . .

RUN v server.v


FROM alpine
WORKDIR /app
COPY --from=build /app/server /app/server

EXPOSE 5005

CMD ["/app/server"]
