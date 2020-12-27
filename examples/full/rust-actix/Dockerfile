FROM rust:1.48 AS build

WORKDIR /app

COPY dummy.rs .
COPY ./Cargo.* ./
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml && \
	cat ./Cargo.toml && \
	cargo build --release && \
	sed -i 's#dummy.rs#src/main.rs#' Cargo.toml

COPY . .

RUN cargo build --release


FROM rust:1.48
WORKDIR /app
COPY --from=build /app/target/release/rust-actix /app/rust-actix

EXPOSE 5004

CMD ["/app/rust-actix"]
