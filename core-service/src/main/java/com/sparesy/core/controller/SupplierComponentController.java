package com.sparesy.core.controller;

import com.sparesy.core.dto.request.SupplierComponentRequestDTO;
import com.sparesy.core.entity.SupplierComponent;
import com.sparesy.core.security.CompanyContext;
import com.sparesy.core.service.SupplierComponentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

// Handles supplier-specific component catalog management
// Suppliers add and update their own listings
// Manufacturer can view any supplier's active catalog
@RestController
@RequestMapping("/api/supplier-components")
public class SupplierComponentController {

    private final SupplierComponentService supplierComponentService;

    public SupplierComponentController(SupplierComponentService supplierComponentService) {
        this.supplierComponentService = supplierComponentService;
    }

    // POST /api/supplier-components
    // Supplier adds a component to their catalog with their own pricing
    // supplierId is extracted from JWT via CompanyContext inside the service
    @PostMapping
    public ResponseEntity<SupplierComponent> addToSupplierCatalog(
            @Valid @RequestBody SupplierComponentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierComponentService.addToSupplierCatalog(dto));
    }

    // GET /api/supplier-components/my
    // Supplier views their own full catalog including inactive listings
    @GetMapping("/my")
    public ResponseEntity<List<SupplierComponent>> getMyCatalog() {
        Long supplierId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(supplierComponentService.getBySupplier(supplierId));
    }

    // GET /api/supplier-components/{supplierId}
    // Manufacturer views a specific supplier's active catalog
    @GetMapping("/{supplierId}")
    public ResponseEntity<List<SupplierComponent>> getSupplierCatalog(
            @PathVariable Long supplierId) {
        return ResponseEntity.ok(supplierComponentService.getActiveBySupplier(supplierId));
    }

    // PUT /api/supplier-components/{id}/stock
    // Supplier updates their stock quantity for a listing
    @PutMapping("/{id}/stock")
    public ResponseEntity<SupplierComponent> updateStock(@PathVariable Long id,
                                                          @RequestParam Integer quantity) {
        return ResponseEntity.ok(supplierComponentService.updateStock(id, quantity));
    }

    // PUT /api/supplier-components/{id}/price
    // Supplier updates their unit price for a listing
    @PutMapping("/{id}/price")
    public ResponseEntity<SupplierComponent> updatePrice(@PathVariable Long id,
                                                          @RequestParam BigDecimal price) {
        return ResponseEntity.ok(supplierComponentService.updatePrice(id, price));
    }
}