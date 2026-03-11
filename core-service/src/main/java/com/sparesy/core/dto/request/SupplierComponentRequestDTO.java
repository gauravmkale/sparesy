package com.sparesy.core.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// Sent by supplier when listing a component they can supply
// componentId references a component already in the manufacturer's master catalog
@Getter
@Setter
public class SupplierComponentRequestDTO {

    @NotNull(message = "Component id is required")
    private Long componentId;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.01", message = "Unit price must be greater than 0")
    private java.math.BigDecimal unitPrice;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @NotNull(message = "Lead time is required")
    @Min(value = 1, message = "Lead time must be at least 1 day")
    private Integer leadTimeDays;
}