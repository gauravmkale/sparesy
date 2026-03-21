package com.sparesy.core.repository;

import com.sparesy.core.entity.SupplierComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface SupplierComponentRepository extends JpaRepository<SupplierComponent, Long> {
    List<SupplierComponent> findBySupplierIdAndIsActive(Long supplierId, Boolean isActive);
    List<SupplierComponent> findByComponentIdAndIsActive(Long componentId, Boolean isActive);
    
    @Query("SELECT sc FROM SupplierComponent sc WHERE sc.supplier.id = :supplierId AND sc.component.id = :componentId")
    List<SupplierComponent> findAllBySupplierIdAndComponentId(Long supplierId, Long componentId);
}
