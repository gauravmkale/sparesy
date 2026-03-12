package com.sparesy.core.controller;

import com.sparesy.core.entity.Inventory;
import com.sparesy.core.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Handles manufacturer inventory management
// No create endpoint — inventory records are auto-created when components are added
// Manufacturer updates stock manually, system flags low stock automatically
@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // GET /api/inventory
    // Manufacturer views all inventory records with current stock levels
    @GetMapping
    public ResponseEntity<List<Inventory>> getInventory() {
        return ResponseEntity.ok(inventoryService.getInventory());
    }

    // GET /api/inventory/component/{componentId}
    // Fetch inventory record for a specific component
    @GetMapping("/component/{componentId}")
    public ResponseEntity<Inventory> getByComponent(@PathVariable Long componentId) {
        return ResponseEntity.ok(inventoryService.getByComponent(componentId));
    }

    // GET /api/inventory/alerts
    // Returns all components where stock is below threshold — manufacturer sees these as alerts
    @GetMapping("/alerts")
    public ResponseEntity<List<Inventory>> getLowStockAlerts() {
        return ResponseEntity.ok(inventoryService.getLowStockAlerts());
    }

    // PUT /api/inventory/{componentId}/stock
    // Manufacturer manually updates stock quantity for a component
    @PutMapping("/{componentId}/stock")
    public ResponseEntity<Inventory> updateStock(@PathVariable Long componentId,
                                                  @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.updateStock(componentId, quantity));
    }
}