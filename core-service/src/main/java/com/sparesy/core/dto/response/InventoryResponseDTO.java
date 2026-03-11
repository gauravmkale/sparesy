package com.sparesy.core.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

// Returned when manufacturer views stock levels
// availableQuantity = quantityOnHand - quantityReserved
// isLowStock = true when quantityOnHand is below reorderThreshold
// No request DTO — inventory records are auto-created by ComponentService
@Getter
@Builder
public class InventoryResponseDTO {
    private Long id;
    private Long componentId;
    private String componentName;
    private String partNumber;
    private Integer quantityOnHand;
    private Integer quantityReserved;
    private Integer availableQuantity;
    private Integer reorderThreshold;
    private Boolean isLowStock;
    private LocalDateTime lastUpdated;
}