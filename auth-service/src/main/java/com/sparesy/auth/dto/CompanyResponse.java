package com.sparesy.auth.dto;

import com.sparesy.auth.enums.CompanyType;
import com.sparesy.auth.model.Company;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CompanyResponse {

    private Long id;
    private String name;
    private String email;
    private CompanyType type;
    private String pinCode;
    private String contactNumber;
    private String gstNumber;
    private String address;
    private String contactPersonName;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Constructor that takes a Company entity and maps it
    // This way we never accidentally expose the password
    public CompanyResponse(Company company) {
        this.id = company.getId();
        this.name = company.getName();
        this.email = company.getEmail();
        this.type = company.getType();
        this.pinCode = company.getPinCode();
        this.contactNumber = company.getContactNumber();
        this.gstNumber = company.getGstNumber();
        this.address = company.getAddress();
        this.contactPersonName = company.getContactPersonName();
        this.isActive = company.getIsActive();
        this.createdAt = company.getCreatedAt();
    }
}