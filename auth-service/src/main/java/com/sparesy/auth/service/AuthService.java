package com.sparesy.auth.service;

import com.sparesy.auth.enums.CompanyType;
import com.sparesy.auth.enums.OnboardingStatus;
import com.sparesy.auth.dto.UpdateCompanyRequest;
import com.sparesy.auth.dto.LoginRequest;
import com.sparesy.auth.dto.LoginResponse;
import com.sparesy.auth.dto.RegisterRequest;
import com.sparesy.auth.model.Company;
import com.sparesy.auth.model.Invitation;
import com.sparesy.auth.repository.CompanyRepository;
import com.sparesy.auth.repository.InvitationRepository;
import com.sparesy.auth.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginResponse login(LoginRequest request) {

        Company company = companyRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!company.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        if (company.getOnboardingStatus() == OnboardingStatus.PENDING) {
            throw new RuntimeException("Account is pending approval from the Manufacturer");
        }
        if (company.getOnboardingStatus() == OnboardingStatus.REJECTED) {
            throw new RuntimeException("Account registration was rejected");
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                company.getPassword()
        );

        if (!passwordMatches) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(company.getId(), company.getType());

        return new LoginResponse(token, company.getId(), company.getType());
    }

    public String createInvitation(String email, CompanyType type) {
        Invitation invitation = invitationRepository.findByEmail(email)
                .filter(i -> !i.getUsed())
                .orElse(Invitation.builder().email(email).type(type).build());

        invitationRepository.save(invitation);
        return invitation.getToken();
    }

    public Invitation validateInvitation(String token) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or missing invitation token"));

        if (invitation.getUsed()) {
            throw new RuntimeException("This invitation has already been used");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This invitation link has expired");
        }

        return invitation;
    }

    public void register(RegisterRequest request) {

        // Enforce invite token for non-manufacturer registrations
        if (request.getType() != CompanyType.MANUFACTURER) {
            if (request.getInviteToken() == null || request.getInviteToken().isBlank()) {
                throw new RuntimeException("An invitation token is required to register");
            }
            validateInvitation(request.getInviteToken());
        }

        boolean emailExists = companyRepository.findByEmail(request.getEmail()).isPresent();
        if (emailExists) {
            throw new RuntimeException("Email already registered");
        }

        boolean gstExists = companyRepository.findByGstNumber(request.getGstNumber()).isPresent();
        if (gstExists) {
            throw new RuntimeException("GST number already registered");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Company company = Company.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(hashedPassword)
            .type(request.getType())
            .pinCode(request.getPinCode())
            .contactNumber(request.getContactNumber())
            .gstNumber(request.getGstNumber())
            .address(request.getAddress())
            .contactPersonName(request.getContactPersonName())
            .onboardingStatus(request.getType() == CompanyType.MANUFACTURER ? OnboardingStatus.APPROVED : OnboardingStatus.PENDING)
            .isActive(true)
            .build();

        companyRepository.save(company);

        // Mark invitation as used
        if (request.getInviteToken() != null) {
            invitationRepository.findByToken(request.getInviteToken())
                .ifPresent(invitation -> {
                    invitation.setUsed(true);
                    invitationRepository.save(invitation);
                });
        }
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    }

    public void updateCompany(Long id, UpdateCompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));

        company.setAddress(request.getAddress());
        company.setContactNumber(request.getContactNumber());
        company.setContactPersonName(request.getContactPersonName());
        company.setPinCode(request.getPinCode());

        companyRepository.save(company);
    }

    public void deactivateCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));

        company.setIsActive(false);
        companyRepository.save(company);
    }
}