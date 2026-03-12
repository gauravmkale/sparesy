package com.sparesy.core.controller;

import com.sparesy.core.entity.Company;
import com.sparesy.core.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Handles all company-related reads in core-service
// Company creation is handled by auth-service — this is read-only
@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    // GET /api/companies/clients
    // Manufacturer views all registered client companies
    @GetMapping("/clients")
    public ResponseEntity<List<Company>> getAllClients() {
        return ResponseEntity.ok(companyService.getAllClients());
    }

    // GET /api/companies/suppliers
    // Manufacturer views all registered supplier companies
    @GetMapping("/suppliers")
    public ResponseEntity<List<Company>> getAllSuppliers() {
        return ResponseEntity.ok(companyService.getAllSuppliers());
    }

    // GET /api/companies/{id}
    // Fetch a single company by id — used internally and by manufacturer
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }
}