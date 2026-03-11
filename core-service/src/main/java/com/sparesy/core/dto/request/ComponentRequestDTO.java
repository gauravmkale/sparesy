package com.sparesy.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

// Sent by manufacturer when adding a new component to the master catalog
// partNumber must be unique — backend will reject duplicates with 409
@Getter
@Setter
public class ComponentRequestDTO {

    @NotBlank(message = "Component name is required")
    private String name;

    @NotBlank(message = "Part number is required")
    private String partNumber;

    // Optional — used for grouping and supplier assignment
    private String category;
    private String description;
}