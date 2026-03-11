package com.sparesy.core.dto.response;

import com.sparesy.core.enums.CompanyType;
import lombok.Builder;
import lombok.Getter;

// Returned when listing clients or suppliers
// Password is deliberately excluded — never send it over the API
@Getter
@Builder
public class CompanyResponseDTO {
    private Long id;
    private String name;
    private String email;
    private CompanyType type;
    private String contactPersonName;
    private String contactNumber;
    private String address;
    private Boolean isActive;
}