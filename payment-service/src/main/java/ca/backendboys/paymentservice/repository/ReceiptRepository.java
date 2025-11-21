package ca.backendboys.paymentservice.repository;

import ca.backendboys.paymentservice.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReceiptRepository extends JpaRepository<Receipt, UUID> {
}

