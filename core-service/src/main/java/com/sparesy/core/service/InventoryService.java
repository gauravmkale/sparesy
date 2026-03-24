package com.sparesy.core.service;

import com.sparesy.core.dto.response.InventoryResponseDTO;
import com.sparesy.core.entity.Component;
import com.sparesy.core.entity.Inventory;
import com.sparesy.core.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ComponentService componentService;

    public InventoryService(InventoryRepository inventoryRepository,
                            ComponentService componentService) {
        this.inventoryRepository = inventoryRepository;
        this.componentService = componentService;
    }

    // Auto-called when a component is added to the catalog — creates a blank inventory record
    public Inventory createInventoryRecord(Long componentId) {
        Component component = componentService.getComponentById(componentId);

        Inventory inventory = new Inventory();
        inventory.setComponent(component);
        inventory.setQuantityOnHand(0);
        inventory.setQuantityReserved(0);
        inventory.setReorderThreshold(0);

        return inventoryRepository.save(inventory);
    }

    // Fetch inventory record for a component
    public Inventory getByComponent(Long componentId) {
        return inventoryRepository.findByComponentId(componentId)
                .orElseThrow(() -> new RuntimeException("Inventory not found for component id: " + componentId));
    }

    // Manufacturer views all inventory
    public List<Inventory> getInventory() {
        return inventoryRepository.findAll();
    }

    // Manufacturer manually updates stock quantity
    public Inventory updateStock(Long componentId, Integer quantity) {
        Inventory inventory = getByComponent(componentId);
        inventory.setQuantityOnHand(quantity);
        return inventoryRepository.save(inventory);
    }

    // Reserve stock when a production order is created
    public Inventory reserveStock(Long componentId, Integer quantity) {
        Inventory inventory = getByComponent(componentId);

        // Make sure there's enough available stock before reserving
        int available = inventory.getQuantityOnHand() - inventory.getQuantityReserved();
        if (available < quantity) {
            throw new RuntimeException("Insufficient stock for component id: " + componentId);
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);
        return inventoryRepository.save(inventory);
    }

    // Returns all inventory records where stock is below reorder threshold
    public List<Inventory> getLowStockAlerts() {
        return inventoryRepository.findLowStock();
    }

    public InventoryResponseDTO toInventoryResponseDTO(Inventory inventory) {
        int available = inventory.getQuantityOnHand() - inventory.getQuantityReserved();
        boolean isLowStock = inventory.getQuantityOnHand() < inventory.getReorderThreshold();
        
        return InventoryResponseDTO.builder()
                .id(inventory.getId())
                .componentId(inventory.getComponent().getId())
                .componentName(inventory.getComponent().getName())
                .partNumber(inventory.getComponent().getPartNumber())
                .quantityOnHand(inventory.getQuantityOnHand())
                .quantityReserved(inventory.getQuantityReserved())
                .availableQuantity(available)
                .reorderThreshold(inventory.getReorderThreshold())
                .isLowStock(isLowStock)
                .lastUpdated(inventory.getLastUpdated())
                .build();
    }

    public List<InventoryResponseDTO> toInventoryResponseDTOs(List<Inventory> inventories) {
        return inventories.stream()
                .map(this::toInventoryResponseDTO)
                .collect(Collectors.toList());
    }
}