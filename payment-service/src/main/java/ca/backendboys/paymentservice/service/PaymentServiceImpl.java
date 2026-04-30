package ca.backendboys.paymentservice.service;



import ca.backendboys.paymentservice.dto.PaymentRequest;
import ca.backendboys.paymentservice.model.Payment;
import ca.backendboys.paymentservice.model.Receipt;
import ca.backendboys.paymentservice.model.PaymentStatus;
import ca.backendboys.paymentservice.repository.PaymentRepository;
import ca.backendboys.paymentservice.repository.ReceiptRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, ReceiptRepository receiptRepository) {
        this.paymentRepository = paymentRepository;
        this.receiptRepository = receiptRepository;
    }

    @Override
    public UUID createPayment(PaymentRequest request) {
        // mock price + shipping for demo
        BigDecimal basePrice = new BigDecimal("100.00");
        int shipDays = request.getShippingChoice().name().equals("EXPEDITED") ? 2 : 5;
        BigDecimal total = basePrice.add(new BigDecimal(shipDays * 5)); // simple shipping calc

        Payment payment = Payment.builder()
                .itemId(request.getItemId())
                .userId(request.getUserId())
                .finalPrice(total)
                .shippingChoice(request.getShippingChoice())
                .status(PaymentStatus.CAPTURED)
                .createdAt(OffsetDateTime.now())
                .cardLast4(request.getCardNumber()
                        .substring(Math.max(request.getCardNumber().length() - 4, 0)))
                .build();

        paymentRepository.save(payment);

        Receipt receipt = Receipt.builder()
                .payment(payment)
                .total(total)
                .shipInDays(shipDays)
                .addressLine("123 Mock St, Toronto, ON")
                .paymentDate(OffsetDateTime.now())
                .build();

        receiptRepository.save(receipt);

        return payment.getId();
    }

    @Override
    public PaymentView getPayment(UUID paymentId) {
        Payment p = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        return new PaymentView(
                p.getId(),
                p.getItemId(),
                p.getUserId(),
                p.getFinalPrice(),
                p.getShippingChoice(),
                p.getStatus(),
                p.getCreatedAt(),
                p.getCardLast4());
    }

    @Override
    public ReceiptView getReceipt(UUID paymentId) {
        Receipt r = receiptRepository.findAll().stream()
                .filter(rc -> rc.getPayment().getId().equals(paymentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Receipt not found"));

        return new ReceiptView(
                r.getId(),
                r.getPayment().getId(),
                r.getTotal(),
                r.getAddressLine(),
                r.getShipInDays(),
                r.getPaymentDate(),
                r.getPayment().getShippingChoice().name());
    }
}

