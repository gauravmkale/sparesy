package com.sparesy.core.service;

import com.sparesy.core.entity.ProductionOrder;
import com.sparesy.core.entity.Project;
import com.sparesy.core.enums.ProductionStage;
import com.sparesy.core.repository.ProductionOrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductionService {

    private final ProductionOrderRepository productionOrderRepository;
    private final ProjectService projectService;

    public ProductionService(ProductionOrderRepository productionOrderRepository,
                             ProjectService projectService) {
        this.productionOrderRepository = productionOrderRepository;
        this.projectService = projectService;
    }

    // Auto-called by WorkflowService when client approves a quote
    public ProductionOrder createProductionOrder(Long projectId) {
        Project project = projectService.getProjectById(projectId);

        ProductionOrder order = new ProductionOrder();
        order.setProject(project);
        order.setCurrentStage(ProductionStage.COMPONENT_PREP);
        order.setActualStart(LocalDateTime.now());

        return productionOrderRepository.save(order);
    }

    // Fetch by id — used internally
    public ProductionOrder getById(Long id) {
        return productionOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Production order not found with id: " + id));
    }

    // Fetch by project — client uses this to track their order
    public ProductionOrder getByProject(Long projectId) {
        return productionOrderRepository.findByProjectId(projectId)
                .orElseThrow(() -> new RuntimeException("Production order not found for project id: " + projectId));
    }

    // Manufacturer staff advances to the next production stage
    public ProductionOrder advanceStage(Long id) {
        ProductionOrder order = getById(id);
        ProductionStage[] stages = ProductionStage.values();
        int currentIndex = order.getCurrentStage().ordinal();

        // If already at the last stage — READY — do nothing
        if (currentIndex >= stages.length - 1) {
            throw new RuntimeException("Production order is already at the final stage.");
        }

        // Move to the next stage in the enum
        order.setCurrentStage(stages[currentIndex + 1]);

        // If we just reached READY, set actual end time
        if (order.getCurrentStage() == ProductionStage.READY) {
            order.setActualEnd(LocalDateTime.now());
        }

        return productionOrderRepository.save(order);
    }

    // Manufacturer views all active production orders
    public List<ProductionOrder> getAllActive() {
        return productionOrderRepository.findAll();
    }
}