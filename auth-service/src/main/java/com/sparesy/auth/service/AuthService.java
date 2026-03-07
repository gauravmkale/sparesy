package com.sparesy.auth.service;

import com.sparesy.auth.dto.UpdateCompanyRequest;
import com.sparesy.auth.dto.LoginRequest;
import com.sparesy.auth.dto.LoginResponse;
import com.sparesy.auth.dto.RegisterRequest;
import com.sparesy.auth.model.Company;
import com.sparesy.auth.repository.CompanyRepository;
import com.sparesy.auth.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

// @Service tells Spring this class contains business logic
@Service
public class AuthService {

    // @Autowired tells Spring to inject these dependencies automatically
    // Spring finds the matching bean and wires it in for you
    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // BCryptPasswordEncoder handles password hashing and verification
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponse login(LoginRequest request) {

        // Step 1 — find the company by email
        // findByEmail returns Optional — meaning it might be empty
        // orElseThrow means: if empty, throw this exception
        Company company = companyRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Step 2 — check if the account is active
        if (!company.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        // Step 3 — verify the password
        // passwordEncoder.matches() hashes what the user typed
        // and compares it to the hash stored in the database
        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                company.getPassword()
        );

        if (!passwordMatches) {
            throw new RuntimeException("Invalid email or password");
        }

        // Step 4 — generate the JWT token
        String token = jwtUtil.generateToken(company.getId(), company.getType());

        // Step 5 — return the response
        // Angular will receive this and redirect based on companyType
        return new LoginResponse(token, company.getId(), company.getType());
    }

    public void register(RegisterRequest request) {

        // Step 1 — check if email already exists
        boolean emailExists = companyRepository.findByEmail(request.getEmail()).isPresent();
        if (emailExists) {
            throw new RuntimeException("Email already registered");
        }

        boolean gstExists = companyRepository.findByGstNumber(request.getGstNumber()).isPresent();
        if(gstExists){
            throw new RuntimeException("GST number already registered");
        }
        // Step 2 — hash the password before saving
        // NEVER save plain text passwords
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Step 3 — build the Company entity using Lombok's @Builder
        // Instead of new Company() and calling setters one by one,
        // builder lets you chain everything cleanly
        Company company = Company.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(hashedPassword)
            .type(request.getType())
            .pincode(request.getPinCode())
            .contactNumber(request.getContactNumber())
            .gstNumber(request.getGstNumber())
            .address(request.getAddress())
            .contactPersonName(request.getContactPersonName())
            .isActive(true)
            .build();

        companyRepository.save(company);
    }

    //Get company by id
    public Company getCompanyById(Long id){
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: "+id));
    }

    //Update company details
    public void updateCompany(Long id, UpdateCompanyRequest request){
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: "+id));

        company.setAddress(request.getAddress());
        company.setContactNumber(request.getContactNumber());
        company.setContactPersonName(request.getContactPersonName());
        company.setPincode(request.getPinCode());

        companyRepository.save(company);
    }

    // Deactivate company
    public void deactivateCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));

        company.setIsActive(false);
        companyRepository.save(company);
    }
}