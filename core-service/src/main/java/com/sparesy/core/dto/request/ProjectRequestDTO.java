package com.sparesy.core.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

// Sent by the client when submitting a new PCB project
// Files (Gerber + BOM) are uploaded separately as multipart — not included here
@Getter
@Setter
public class ProjectRequestDTO {

    @NotBlank(message = "Project name is required")
    private String name;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // Optional PCB specs — client may not fill all of these
    private String layerCount;
    private String boardThickness;
    private String surfaceFinish;
}