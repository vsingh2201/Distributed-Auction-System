package ca.backendboys.paymentservice.controller;


import ca.backendboys.paymentservice.dto.PaymentRequest;
import ca.backendboys.paymentservice.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * UC5: Create a payment (winner only).
     * Returns the generated paymentId.
     */
    @PostMapping("/payments")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody PaymentRequest request) {
        UUID paymentId = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("paymentId", paymentId));
    }

    /**
     * UC6: Get payment details by id.
     */
    @GetMapping("/payments/{paymentId}")
    public PaymentService.PaymentView getPayment(@PathVariable UUID paymentId) {
        return paymentService.getPayment(paymentId);
    }

    /**
     * UC6: Get receipt by payment id.
     */
    @GetMapping("/receipts/{paymentId}")
    public PaymentService.ReceiptView getReceipt(@PathVariable UUID paymentId) {
        return paymentService.getReceipt(paymentId);
    }
}

