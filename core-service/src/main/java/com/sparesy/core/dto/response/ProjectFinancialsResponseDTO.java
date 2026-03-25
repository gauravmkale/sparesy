package com.sparesy.core.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class ProjectFinancialsResponseDTO {
    private Long projectId;
    private String projectName;
    private BigDecimal revenue;
    private BigDecimal cost;
    private BigDecimal profit;
    private String status;
}
