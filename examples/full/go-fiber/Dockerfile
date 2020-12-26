FROM golang:1.15.6-alpine AS build
WORKDIR /src
ENV CGO_ENABLED=0
COPY . .
RUN go build -o /out/go-fiber .

FROM scratch AS bin
COPY --from=build /out/go-fiber /
EXPOSE 5002

CMD ["./go-fiber"]
