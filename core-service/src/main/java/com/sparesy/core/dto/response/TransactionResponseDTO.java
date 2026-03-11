package com.sparesy.core.dto.response;

import com.sparesy.core.enums.TransactionType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Returned when any portal views their revenue or cost summary
// No request DTO — transactions are auto-recorded by WorkflowService
@Getter
@Builder
public class TransactionResponseDTO {
    private Long id;
    private Long companyId;
    private String companyName;
    private Long projectId;
    private String projectName;
    private Long componentId;
    private String componentName;
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private LocalDateTime createdAt;
}