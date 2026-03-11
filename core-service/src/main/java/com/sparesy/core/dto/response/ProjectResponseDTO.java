package com.sparesy.core.dto.response;

import com.sparesy.core.enums.ProjectStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

// Returned when fetching project list or project detail
// clientName is included so the frontend doesn't need a second API call
@Getter
@Builder
public class ProjectResponseDTO {
    private Long id;
    private String name;
    private Integer quantity;
    private String layerCount;
    private String boardThickness;
    private String surfaceFinish;
    private ProjectStatus status;

    // Flattened from the Company relationship — just the name, not the whole object
    private Long clientCompanyId;
    private String clientName;

    private String gerberFilePath;
    private String bomFilePath;
    private LocalDateTime expectedDelivery;
    private LocalDateTime submittedAt;
}