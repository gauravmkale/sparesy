package com.sparesy.core.dto.response;

import com.sparesy.core.enums.RequestStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Returned when listing requests for a project or for a supplier
// All foreign key names are flattened — supplierName, componentName etc
@Getter
@Builder
public class RequestResponseDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long supplierCompanyId;
    private String supplierName;
    private Long componentId;
    private String componentName;
    private String partNumber;
    private Integer quantityNeeded;
    private RequestStatus status;

    // Filled in by supplier when they respond
    private BigDecimal quotedPrice;
    private LocalDateTime quotedDelivery;
    private LocalDateTime createdAt;
    private LocalDateTime quotedAt;
}