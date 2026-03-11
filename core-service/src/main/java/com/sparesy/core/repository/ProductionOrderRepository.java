package com.sparesy.core.repository;

import com.sparesy.core.entity.ProductionOrder;
import com.sparesy.core.enums.ProductionStage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long> {
    Optional<ProductionOrder> findByProjectId(Long projectId);
    List<ProductionOrder> findByCurrentStage(ProductionStage stage);
}