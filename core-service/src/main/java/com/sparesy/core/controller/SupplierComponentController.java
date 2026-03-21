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

@RestController
@RequestMapping("/api/supplier-components")
public class SupplierComponentController {

    private final SupplierComponentService supplierComponentService;

    public SupplierComponentController(SupplierComponentService supplierComponentService) {
        this.supplierComponentService = supplierComponentService;
    }

    @PostMapping
    public ResponseEntity<SupplierComponent> addToSupplierCatalog(
            @Valid @RequestBody SupplierComponentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierComponentService.addToSupplierCatalog(dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SupplierComponent>> getMyCatalog() {
        Long supplierId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(supplierComponentService.getBySupplier(supplierId));
    }

    @GetMapping("/{supplierId}")
    public ResponseEntity<List<SupplierComponent>> getSupplierCatalog(
            @PathVariable Long supplierId) {
        return ResponseEntity.ok(supplierComponentService.getActiveBySupplier(supplierId));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<SupplierComponent> updateStock(@PathVariable Long id,
                                                          @RequestParam Integer quantity) {
        return ResponseEntity.ok(supplierComponentService.updateStock(id, quantity));
    }

    @PutMapping("/{id}/price")
    public ResponseEntity<SupplierComponent> updatePrice(@PathVariable Long id,
                                                          @RequestParam BigDecimal price) {
        return ResponseEntity.ok(supplierComponentService.updatePrice(id, price));
    }

    // Using PUT for deletion to bypass potential 405 Method Not Supported issues with DELETE in some environments
    @PutMapping("/{id}/delete")
    public ResponseEntity<Void> deleteFromCatalog(@PathVariable Long id) {
        supplierComponentService.deleteFromCatalog(id);
        return ResponseEntity.ok().build();
    }
}
