package com.sparesy.core.controller;

import com.sparesy.core.dto.request.SupplierComponentRequestDTO;
import com.sparesy.core.dto.response.SupplierComponentResponseDTO;
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
    public ResponseEntity<SupplierComponentResponseDTO> addToSupplierCatalog(
            @Valid @RequestBody SupplierComponentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierComponentService.toSupplierComponentResponseDTO(supplierComponentService.addToSupplierCatalog(dto)));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SupplierComponentResponseDTO>> getMyCatalog() {
        Long supplierId = CompanyContext.getCurrentCompanyId();
        return ResponseEntity.ok(supplierComponentService.toSupplierComponentResponseDTOs(supplierComponentService.getBySupplier(supplierId)));
    }

    @GetMapping("/{supplierId}")
    public ResponseEntity<List<SupplierComponentResponseDTO>> getSupplierCatalog(
            @PathVariable Long supplierId) {
        return ResponseEntity.ok(supplierComponentService.toSupplierComponentResponseDTOs(supplierComponentService.getActiveBySupplier(supplierId)));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<SupplierComponentResponseDTO> updateStock(@PathVariable Long id,
                                                          @RequestParam Integer quantity) {
        return ResponseEntity.ok(supplierComponentService.toSupplierComponentResponseDTO(supplierComponentService.updateStock(id, quantity)));
    }

    @PutMapping("/{id}/price")
    public ResponseEntity<SupplierComponentResponseDTO> updatePrice(@PathVariable Long id,
                                                          @RequestParam BigDecimal price) {
        return ResponseEntity.ok(supplierComponentService.toSupplierComponentResponseDTO(supplierComponentService.updatePrice(id, price)));
    }

    // Using PUT for deletion to bypass potential 405 Method Not Supported issues with DELETE in some environments
    @PutMapping("/{id}/delete")
    public ResponseEntity<Void> deleteFromCatalog(@PathVariable Long id) {
        supplierComponentService.deleteFromCatalog(id);
        return ResponseEntity.ok().build();
    }
}
