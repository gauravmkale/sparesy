package com.sparesy.core.repository;

import com.sparesy.core.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByComponentId(Long componentId);
    // Used for low stock alerts
    List<Inventory> findByQuantityOnHandLessThan(Integer threshold);
}