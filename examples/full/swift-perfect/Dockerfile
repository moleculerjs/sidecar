FROM swift:5.3 as builder
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y openssl libssl-dev uuid-dev
RUN swift build

FROM swift:5.3-slim
WORKDIR /app
COPY --from=builder /app/.build/x86_64-unknown-linux-gnu/debug/ ./
EXPOSE 5008
CMD ["./server"]
