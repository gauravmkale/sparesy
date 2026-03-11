package com.sparesy.core.repository;

import com.sparesy.core.entity.SupplierComponent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierComponentRepository extends JpaRepository<SupplierComponent, Long> {
    List<SupplierComponent> findBySupplierId(Long supplierId);
    List<SupplierComponent> findByComponentId(Long componentId);
    List<SupplierComponent> findBySupplierIdAndIsActive(Long supplierId, Boolean isActive);
}