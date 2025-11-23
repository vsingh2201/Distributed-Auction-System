# EECS 4413 Team 8 Auction Project

## To Run a Single Microservice using Maven

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

For example, auction-service
Use the following URL and Gateway will map it to Auction Service

```bash
  http://localhost:9191/auction-service
```
