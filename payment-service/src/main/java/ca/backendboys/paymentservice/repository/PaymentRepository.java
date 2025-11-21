package ca.backendboys.paymentservice.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import ca.backendboys.paymentservice.model.Payment;

import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
}

