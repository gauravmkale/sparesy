package com.sparesy.core.controller;

import com.sparesy.core.entity.Company;
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
    public ResponseEntity<List<Company>> getAllClients() {
        return ResponseEntity.ok(companyService.getAllClients());
    }

    @GetMapping("/Approvedclients")
    public ResponseEntity<List<Company>> getAllApprovedClients() {
        return ResponseEntity.ok(companyService.getAllApprovedClients());
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<Company>> getAllSuppliers() {
        return ResponseEntity.ok(companyService.getAllSuppliers());
    }

    @GetMapping("/Approvedsuppliers")
    public ResponseEntity<List<Company>> getAllApprovedSuppliers() {
        return ResponseEntity.ok(companyService.getAllApprovedSuppliers());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Company>> getPendingCompanies() {
        return ResponseEntity.ok(companyService.getPendingCompanies());
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
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

}
