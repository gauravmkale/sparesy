package com.sparesy.core.dto.response;

import com.sparesy.core.enums.QuoteStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Returned when manufacturer or client fetches a quote
// clientNote is what the client writes when approving or rejecting
@Getter
@Builder
public class QuoteResponseDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private BigDecimal totalPrice;
    private Integer leadTimeDays;
    private String lineItemsJson;
    private QuoteStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private LocalDateTime clientResponseAt;
}