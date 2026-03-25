package com.sparesy.core.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class ClientFinancialsResponseDTO {
    private Long clientId;
    private String clientName;
    private BigDecimal totalRevenue;
    private BigDecimal totalProfit;
    private List<ProjectFinancialsResponseDTO> projects;
}
