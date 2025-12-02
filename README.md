# EECS 4413 Team 8 Auction Project

## To Run the Project Using Docker
First, make sure there is a jar file inside the target folder of each service.<br>
Run the following command at the project root to generate jar files for each service.
```bash
  mvn clean package -DskipTests
```

Use docker compose build to create images
```bash
  docker compose build
```
Use docker compose up to run the images in containers
```bash
  docker compose up
```
Go to the following Url to access the application after running docker compose up
```bash
  http://localhost:9191/
```

To run the containers in detached mode
```bash
  docker compose up -d
```
To stop and remove the containers
```bash
  docker compose down
```
## To Run a Single Microservice using Maven (without Docker)

Go to the microservice folder (for example, auction-service)

```bash
  cd eecs4413-microservices-auction-project/auction-service
```

Use mvnw script to run the microservice

```bash
  ./mvnw spring-boot:run
```

## To Run the whole project

First run the service-registry and api-gateway services and then run the other microservices using the same mvnw command.

## Check Eureka Server to see the status of Each Service

```bash
  http://localhost:8761/
```

## Spring Cloud API Gateway URL

```bash
  http://localhost:9191/
```

## To access a service using Gateway

For example, auction-service<br>
Use the following URL and Gateway will map it to Auction Service

```bash
  http://localhost:9191/auction-service
```
