package com.sparesy.core.dto.response;

import com.sparesy.core.enums.CompanyType;
import com.sparesy.core.enums.OnboardingStatus;
import lombok.Builder;
import lombok.Getter;

// Returned when listing clients, suppliers, or pending companies.
// Password is deliberately excluded — never send it over the API.
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
    private String gstNumber;
    private OnboardingStatus onboardingStatus;
    private Boolean isActive;
}