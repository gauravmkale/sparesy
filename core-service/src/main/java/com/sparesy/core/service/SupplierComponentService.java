package com.sparesy.core.service;

import com.sparesy.core.dto.request.SupplierComponentRequestDTO;
import com.sparesy.core.entity.Component;
import com.sparesy.core.entity.Company;
import com.sparesy.core.entity.SupplierComponent;
import com.sparesy.core.repository.SupplierComponentRepository;
import com.sparesy.core.security.CompanyContext;
import org.springframework.stereotype.Service;

import java.util.List;

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

    // Supplier adds a component from master catalog to their own catalog with their pricing
    public SupplierComponent addToSupplierCatalog(SupplierComponentRequestDTO dto) {
        Long supplierId = CompanyContext.getCurrentCompanyId();

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

    // Supplier views their own catalog
    public List<SupplierComponent> getBySupplier(Long supplierId) {
        return supplierComponentRepository.findBySupplierId(supplierId);
    }

    // Manufacturer views a specific supplier's catalog
    public List<SupplierComponent> getActiveBySupplier(Long supplierId) {
        return supplierComponentRepository.findBySupplierIdAndIsActive(supplierId, true);
    }

    // Fetch single supplier component — used internally
    public SupplierComponent getById(Long id) {
        return supplierComponentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier component not found with id: " + id));
    }

    // Supplier updates their stock quantity
    public SupplierComponent updateStock(Long id, Integer quantity) {
        SupplierComponent sc = getById(id);
        sc.setStockQuantity(quantity);
        return supplierComponentRepository.save(sc);
    }

    // Supplier updates their unit price
    public SupplierComponent updatePrice(Long id, java.math.BigDecimal price) {
        SupplierComponent sc = getById(id);
        sc.setUnitPrice(price);
        return supplierComponentRepository.save(sc);
    }
}