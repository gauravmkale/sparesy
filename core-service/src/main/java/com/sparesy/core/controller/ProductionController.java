package com.sparesy.core.controller;

import com.sparesy.core.entity.ProductionOrder;
import com.sparesy.core.service.ProductionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Handles production order tracking
// No create endpoint — production orders are auto-created by WorkflowService
// Manufacturer staff advance stages, client tracks progress
@RestController
@RequestMapping("/api/production")
public class ProductionController {

    private final ProductionService productionService;

    public ProductionController(ProductionService productionService) {
        this.productionService = productionService;
    }

    // GET /api/production
    // Manufacturer views all active production orders
    @GetMapping
    public ResponseEntity<List<ProductionOrder>> getAllActive() {
        return ResponseEntity.ok(productionService.getAllActive());
    }

    // GET /api/production/{id}
    // Fetch a single production order by id
    @GetMapping("/{id}")
    public ResponseEntity<ProductionOrder> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productionService.getById(id));
    }

    // GET /api/production/project/{projectId}
    // Client or manufacturer fetches production order for a specific project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ProductionOrder> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(productionService.getByProject(projectId));
    }

    // PUT /api/production/{id}/advance
    // Manufacturer staff advances the production order to the next stage
    // Automatically moves through the ProductionStage enum in order
    @PutMapping("/{id}/advance")
    public ResponseEntity<ProductionOrder> advanceStage(@PathVariable Long id) {
        return ResponseEntity.ok(productionService.advanceStage(id));
    }
}