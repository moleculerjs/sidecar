FROM rust:1.48 AS build

RUN apt-get update && apt-get -y install musl-tools --no-install-recommends \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN rustup target add x86_64-unknown-linux-musl

RUN USER=root cargo new --bin app
WORKDIR /app

COPY ./Cargo.* ./
RUN cargo build --release
RUN rm src/*.rs

COPY . ./

RUN cargo build --target x86_64-unknown-linux-musl --release

# hadolint ignore=DL3006
FROM alpine

COPY --from=build /app/target/x86_64-unknown-linux-musl/release/rust-actix /app/rust-actix
EXPOSE 5004

CMD ["/app/rust-actix"]
