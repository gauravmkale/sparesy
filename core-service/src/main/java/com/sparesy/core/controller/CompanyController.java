package com.sparesy.core.controller;

import com.sparesy.core.dto.response.CompanyResponseDTO;
import com.sparesy.core.entity.Company;
import com.sparesy.core.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // Helper: map a Company entity to CompanyResponseDTO (excludes password)
    private CompanyResponseDTO toDTO(Company c) {
        return CompanyResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .email(c.getEmail())
                .type(c.getType())
                .contactPersonName(c.getContactPersonName())
                .contactNumber(c.getContactNumber())
                .address(c.getAddress())
                .gstNumber(c.getGstNumber())
                .onboardingStatus(c.getOnboardingStatus())
                .isActive(c.getIsActive())
                .build();
    }

    @GetMapping("/clients")
    public ResponseEntity<List<CompanyResponseDTO>> getAllClients() {
        return ResponseEntity.ok(companyService.getAllClients().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    // Fixed: was /Approvedclients (wrong casing) — now /approved-clients
    @GetMapping("/approved-clients")
    public ResponseEntity<List<CompanyResponseDTO>> getAllApprovedClients() {
        return ResponseEntity.ok(companyService.getAllApprovedClients().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<CompanyResponseDTO>> getAllSuppliers() {
        return ResponseEntity.ok(companyService.getAllSuppliers().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    // Fixed: was /Approvedsuppliers (wrong casing) — now /approved-suppliers
    @GetMapping("/approved-suppliers")
    public ResponseEntity<List<CompanyResponseDTO>> getAllApprovedSuppliers() {
        return ResponseEntity.ok(companyService.getAllApprovedSuppliers().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CompanyResponseDTO>> getPendingCompanies() {
        return ResponseEntity.ok(companyService.getPendingCompanies().stream().map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveCompany(@PathVariable Long id) {
        companyService.approveCompany(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectCompany(@PathVariable Long id) {
        companyService.rejectCompany(id);
        return ResponseEntity.ok().build();
    }

    // Using PUT for deletion — avoids 405 Method Not Allowed issues with DELETE in some environments
    @PutMapping("/{id}/delete")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(toDTO(companyService.getCompanyById(id)));
    }
}
