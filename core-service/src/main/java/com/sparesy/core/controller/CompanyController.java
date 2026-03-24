package com.sparesy.core.controller;

import com.sparesy.core.dto.response.CompanyResponseDTO;
import com.sparesy.core.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/clients")
    public ResponseEntity<List<CompanyResponseDTO>> getAllClients() {
        return ResponseEntity.ok(companyService.toCompanyResponseDTOs(companyService.getAllClients()));
    }

    @GetMapping("/Approvedclients")
    public ResponseEntity<List<CompanyResponseDTO>> getAllApprovedClients() {
        return ResponseEntity.ok(companyService.toCompanyResponseDTOs(companyService.getAllApprovedClients()));
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<CompanyResponseDTO>> getAllSuppliers() {
        return ResponseEntity.ok(companyService.toCompanyResponseDTOs(companyService.getAllSuppliers()));
    }

    @GetMapping("/Approvedsuppliers")
    public ResponseEntity<List<CompanyResponseDTO>> getAllApprovedSuppliers() {
        return ResponseEntity.ok(companyService.toCompanyResponseDTOs(companyService.getAllApprovedSuppliers()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CompanyResponseDTO>> getPendingCompanies() {
        return ResponseEntity.ok(companyService.toCompanyResponseDTOs(companyService.getPendingCompanies()));
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

    // Using PUT for deletion to bypass potential 405 Method Not Supported issues with DELETE in some environments
    @PutMapping("/{id}/delete")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.toCompanyResponseDTO(companyService.getCompanyById(id)));
    }

}
