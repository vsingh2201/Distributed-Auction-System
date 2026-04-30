FROM --platform=linux/arm64 eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy Jar
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Directory for SQLite DB
RUN mkdir -p /data

# Use docker profile
ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8084

ENTRYPOINT ["java","-jar","/app/app.jar"]
