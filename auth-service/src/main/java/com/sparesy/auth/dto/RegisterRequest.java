package com.sparesy.auth.dto;

import com.sparesy.auth.enums.CompanyType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    // confirmPassword is NOT here — frontend only
    private CompanyType type;
    private String pinCode;
    private String contactNumber;
    private String gstNumber;
    private String address;
    private String contactPersonName;
}