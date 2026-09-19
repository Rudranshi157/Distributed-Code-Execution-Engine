FROM eclipse-temurin:21-jdk

RUN userdel -r ubuntu && \
    useradd -m -u 1000 -U runner

USER runner

WORKDIR /app
