package com.sparesy.core.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

// Sent by manufacturer when building a client-facing quote
// lineItemsJson is a pre-serialized JSON string built on the frontend
// totalPrice = components + assembly + shipping combined
@Getter
@Setter
public class QuoteRequestDTO {

    @NotNull(message = "Project id is required")
    private Long projectId;

    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.01", message = "Total price must be greater than 0")
    private BigDecimal totalPrice;

    @NotNull(message = "Lead time is required")
    @Min(value = 1, message = "Lead time must be at least 1 day")
    private Integer leadTimeDays;

    // JSON string — example:
    // [{"description":"Resistor 10k","qty":100,"unitPrice":0.05,"total":5.00}]
    @NotBlank(message = "Line items are required")
    private String lineItemsJson;

    // Optional note from manufacturer to client
    private String notes;
}