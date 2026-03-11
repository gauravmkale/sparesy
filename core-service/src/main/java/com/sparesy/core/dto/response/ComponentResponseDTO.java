package com.sparesy.core.dto.response;

import lombok.Builder;
import lombok.Getter;

// Returned when listing catalog components or fetching one by id
@Getter
@Builder
public class ComponentResponseDTO {
    private Long id;
    private String name;
    private String partNumber;
    private String category;
    private String description;
}