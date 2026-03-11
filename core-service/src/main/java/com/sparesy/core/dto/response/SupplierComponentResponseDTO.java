package com.sparesy.core.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

// Returned when manufacturer or supplier views the supplier's catalog
// Includes component details flattened in — no nested objects
@Getter
@Builder
public class SupplierComponentResponseDTO {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long componentId;
    private String componentName;
    private String partNumber;
    private BigDecimal unitPrice;
    private Integer stockQuantity;
    private Integer leadTimeDays;
    private Boolean isActive;
}