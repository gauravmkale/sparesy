package com.sparesy.core.service;

import com.sparesy.core.dto.request.SupplierComponentRequestDTO;
import com.sparesy.core.dto.response.SupplierComponentResponseDTO;
import com.sparesy.core.entity.Component;
import com.sparesy.core.entity.Company;
import com.sparesy.core.entity.SupplierComponent;
import com.sparesy.core.repository.SupplierComponentRepository;
import com.sparesy.core.security.CompanyContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierComponentService {

    private final SupplierComponentRepository supplierComponentRepository;
    private final ComponentService componentService;
    private final CompanyService companyService;

    public SupplierComponentService(SupplierComponentRepository supplierComponentRepository,
                                     ComponentService componentService,
                                     CompanyService companyService) {
        this.supplierComponentRepository = supplierComponentRepository;
        this.componentService = componentService;
        this.companyService = companyService;
    }

    @Transactional
    public SupplierComponent addToSupplierCatalog(SupplierComponentRequestDTO dto) {
        Long supplierId = CompanyContext.getCurrentCompanyId();

        // Find all existing entries (including inactive or duplicates from previous bugs)
        List<SupplierComponent> existing = 
            supplierComponentRepository.findAllBySupplierIdAndComponentId(supplierId, dto.getComponentId());

        if (!existing.isEmpty()) {
            // Take the first one as our primary entry
            SupplierComponent sc = existing.get(0);
            sc.setStockQuantity(sc.getStockQuantity() + dto.getStockQuantity());
            sc.setUnitPrice(dto.getUnitPrice());
            sc.setLeadTimeDays(dto.getLeadTimeDays());
            sc.setIsActive(true); // Reactivate if it was deleted

            // If there were multiple duplicates, deactivate the rest to clean up data
            for (int i = 1; i < existing.size(); i++) {
                SupplierComponent duplicate = existing.get(i);
                duplicate.setIsActive(false);
                supplierComponentRepository.save(duplicate);
            }

            return supplierComponentRepository.save(sc);
        }

        Company supplier = companyService.getCompanyById(supplierId);
        Component component = componentService.getComponentById(dto.getComponentId());

        SupplierComponent sc = new SupplierComponent();
        sc.setSupplier(supplier);
        sc.setComponent(component);
        sc.setUnitPrice(dto.getUnitPrice());
        sc.setStockQuantity(dto.getStockQuantity());
        sc.setLeadTimeDays(dto.getLeadTimeDays());
        sc.setIsActive(true);

        return supplierComponentRepository.save(sc);
    }

    public void deleteFromCatalog(Long id) {
        Long supplierId = CompanyContext.getCurrentCompanyId();
        SupplierComponent sc = getById(id);
        
        if (!sc.getSupplier().getId().equals(supplierId)) {
            throw new RuntimeException("You can only delete items from your own catalog");
        }
        
        sc.setIsActive(false);
        supplierComponentRepository.save(sc);
    }

    public List<SupplierComponent> getBySupplier(Long supplierId) {
        return supplierComponentRepository.findBySupplierIdAndIsActive(supplierId, true);
    }

    public List<SupplierComponent> getActiveBySupplier(Long supplierId) {
        return supplierComponentRepository.findBySupplierIdAndIsActive(supplierId, true);
    }

    public SupplierComponent getById(Long id) {
        return supplierComponentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier component not found with id: " + id));
    }

    public SupplierComponent updateStock(Long id, Integer quantity) {
        SupplierComponent sc = getById(id);
        sc.setStockQuantity(quantity);
        return supplierComponentRepository.save(sc);
    }

    public SupplierComponent updatePrice(Long id, java.math.BigDecimal price) {
        SupplierComponent sc = getById(id);
        sc.setUnitPrice(price);
        return supplierComponentRepository.save(sc);
    }

    // DTO Conversion Methods
    public SupplierComponentResponseDTO toSupplierComponentResponseDTO(SupplierComponent sc) {
        return SupplierComponentResponseDTO.builder()
                .id(sc.getId())
                .supplierId(sc.getSupplier().getId())
                .supplierName(sc.getSupplier().getName())
                .componentId(sc.getComponent().getId())
                .componentName(sc.getComponent().getName())
                .partNumber(sc.getComponent().getPartNumber())
                .unitPrice(sc.getUnitPrice())
                .stockQuantity(sc.getStockQuantity())
                .leadTimeDays(sc.getLeadTimeDays())
                .isActive(sc.getIsActive())
                .build();
    }

    public List<SupplierComponentResponseDTO> toSupplierComponentResponseDTOs(List<SupplierComponent> scs) {
        return scs.stream()
                .map(this::toSupplierComponentResponseDTO)
                .collect(Collectors.toList());
    }
}
