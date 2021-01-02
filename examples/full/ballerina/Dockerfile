FROM ballerina/ballerina as builder
WORKDIR /home/ballerina
USER root
RUN mkdir -p src && chmod 777 src
COPY . .
#RUN ballerina build server
#RUN ls -al
CMD ["ballerina", "run", "server"]

# FROM ballerina/jre8:v1
# RUN addgroup troupe \
# 	&& adduser -S -s /bin/bash -g 'ballerina' -G troupe -D ballerina \
# 	&& apk add --update --no-cache bash \
# 	&& chown -R ballerina:troupe /usr/bin/java \
# 	&& rm -rf /var/cache/apk/*

# WORKDIR /home/ballerina
# COPY --from=builder /home/ballerina/target/bin/server.jar ./
# USER ballerina

# EXPOSE 5009

# CMD ["java", "-jar", "server.jar"]
