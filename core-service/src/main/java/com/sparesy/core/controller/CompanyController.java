package com.sparesy.core.controller;

import com.sparesy.core.entity.Company;
import com.sparesy.core.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Handles all company-related reads and manufacturer approvals in core-service
// Company registration is handled by auth-service
@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // GET /api/companies/clients
    @GetMapping("/clients")
    public ResponseEntity<List<Company>> getAllClients() {
        return ResponseEntity.ok(companyService.getAllClients());
    }

    @GetMapping("/Approvedclients")
    public ResponseEntity<List<Company>> getAllApprovedClients() {
        return ResponseEntity.ok(companyService.getAllApprovedClients());
    }
    

    // GET /api/companies/suppliers
    @GetMapping("/suppliers")
    public ResponseEntity<List<Company>> getAllSuppliers() {
        return ResponseEntity.ok(companyService.getAllSuppliers());
    }

    @GetMapping("/Approvedsuppliers")
    public ResponseEntity<List<Company>> getAllApprovedSuppliers() {
        return ResponseEntity.ok(companyService.getAllApprovedSuppliers());
    }


    // GET /api/companies/pending
    // Manufacturer views all companies waiting for approval
    @GetMapping("/pending")
    public ResponseEntity<List<Company>> getPendingCompanies() {
        return ResponseEntity.ok(companyService.getPendingCompanies());
    }

    // PUT /api/companies/{id}/approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveCompany(@PathVariable Long id) {
        companyService.approveCompany(id);
        return ResponseEntity.ok().build();
    }

    // PUT /api/companies/{id}/reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectCompany(@PathVariable Long id) {
        companyService.rejectCompany(id);
        return ResponseEntity.ok().build();
    }

    // GET /api/companies/{id}
    // Fetch a single company by id — used internally and by manufacturer
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }
}