package com.sparesy.auth.dto;

import com.sparesy.auth.enums.CompanyType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    // Angular stores this token and attaches it to every future request
    private String token;

    // Angular uses these two to decide which portal to show
    private Long companyId;
    private CompanyType companyType;
}