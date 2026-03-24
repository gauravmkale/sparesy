package com.sparesy.core.controller;

import com.sparesy.core.dto.request.ComponentRequestDTO;
import com.sparesy.core.entity.Component;
import com.sparesy.core.service.ComponentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Handles the master component catalog
// Manufacturer adds components, everyone can browse
// Part numbers must be unique — duplicates are rejected with a clear error
@RestController
@RequestMapping("/api/components")
public class ComponentController {

    private final ComponentService componentService;

    public ComponentController(ComponentService componentService) {
        this.componentService = componentService;
    }

    // POST /api/components
    // Manufacturer adds a new component to the master catalog
    @PostMapping
    public ResponseEntity<Component> addComponent(@Valid @RequestBody ComponentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(componentService.addComponent(dto));
    }

    // GET /api/components
    // Returns all components in the catalog
    @GetMapping
    public ResponseEntity<List<Component>> getAllComponents() {
        return ResponseEntity.ok(componentService.getAllComponents());
    }

    // GET /api/components/{id}
    // Fetch a single component by id
    @GetMapping("/{id}")
    public ResponseEntity<Component> getComponentById(@PathVariable Long id) {
        return ResponseEntity.ok(componentService.getComponentById(id));
    }

    // GET /api/components/search?partNumber=ABC123
    // Search by exact part number — used during BOM matching

    @GetMapping("/search")
    public ResponseEntity<List<Component>> searchByPartNumber(@RequestParam String partNumber){
        return ResponseEntity.ok(componentService.searchByKeyword(partNumber));
    }

    // GET /api/components/category?category=Resistors
    // Filter components by category
    @GetMapping("/category")
    public ResponseEntity<List<Component>> getByCategory(@RequestParam String category) {
        return ResponseEntity.ok(componentService.getByCategory(category));
    }

}