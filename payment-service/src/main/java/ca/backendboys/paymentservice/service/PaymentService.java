package ca.backendboys.paymentservice.service;



import ca.backendboys.paymentservice.dto.PaymentRequest;
import ca.backendboys.paymentservice.model.PaymentStatus;
import ca.backendboys.paymentservice.model.ShippingChoice;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Service contract for the Payment use cases (UC5 & UC6).
 * We return simple primitives here to keep the interface stable;
 * the controller will assemble DTO responses.
 */
public interface PaymentService {

    /**
     * Creates a payment record and a matching receipt snapshot.
     * Returns the generated paymentId.
     */
    UUID createPayment(PaymentRequest request);

    /**
     * Gets the current state/details of a payment.
     */
    record PaymentView(
            UUID paymentId,
            UUID itemId,
            UUID userId,
            BigDecimal finalPrice,
            ShippingChoice shippingChoice,
            PaymentStatus status,
            OffsetDateTime createdAt,
            String cardLast4) {
    }

    /**
     * Returns a view of the payment for the given paymentId.
     */
    PaymentView getPayment(UUID paymentId);

    /**
     * Snapshot view of the receipt for a payment.
     */
    record ReceiptView(
            UUID receiptId,
            UUID paymentId,
            BigDecimal total,
            String addressLine,
            Integer shipInDays,
            OffsetDateTime paymentDate) {
    }

    /**
     * Returns the receipt view for the given paymentId.
     */
    ReceiptView getReceipt(UUID paymentId);
}

