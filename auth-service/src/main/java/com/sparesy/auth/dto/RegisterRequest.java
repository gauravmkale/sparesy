package com.sparesy.auth.dto;

import com.sparesy.auth.enums.CompanyType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 100, message = "Company name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Company type is required")
    private CompanyType type;

    @NotBlank(message = "Pin code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "Pin code must be 6 digits")
    private String pinCode;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    private String contactNumber;

    @NotBlank(message = "GST number is required")
    @Size(min = 15, max = 15, message = "GST number must be exactly 15 characters")
    private String gstNumber;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Contact person name is required")
    private String contactPersonName;

    //Invite token for manufacturer's link.
    private String inviteToken;
}