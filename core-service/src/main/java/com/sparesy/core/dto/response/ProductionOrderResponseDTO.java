package com.sparesy.core.dto.response;

import com.sparesy.core.enums.ProductionStage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

// Returned when manufacturer or client checks production status
// stageHistoryJson contains a log of all previous stages with timestamps
// No request DTO — production orders are auto-created by WorkflowService
@Getter
@Builder
public class ProductionOrderResponseDTO {
    private Long id;
    private Long projectId;
    private String projectName;
    private ProductionStage currentStage;
    private String stageHistoryJson;
    private LocalDateTime plannedStart;
    private LocalDateTime plannedEnd;
    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;
    private LocalDateTime createdAt;
}