package com.sparesy.core.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// Sent by manufacturer when creating a component request to a supplier
// The manufacturer picks which supplier, which component, and how many they need
@Getter
@Setter
public class RequestRequestDTO {

    @NotNull(message = "Project id is required")
    private Long projectId;

    @NotNull(message = "Supplier company id is required")
    private Long supplierCompanyId;

    @NotNull(message = "Component id is required")
    private Long componentId;

    @NotNull(message = "Quantity needed is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantityNeeded;

    private BigDecimal targetPrice;
    
    private LocalDateTime targetDelivery;
}
