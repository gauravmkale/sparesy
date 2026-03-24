package com.sparesy.core.service;

import com.sparesy.core.dto.request.ComponentRequestDTO;
import com.sparesy.core.dto.response.ComponentResponseDTO;
import com.sparesy.core.entity.Component;
import com.sparesy.core.repository.ComponentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComponentService {

    private final ComponentRepository componentRepository;

    public ComponentService(ComponentRepository componentRepository) {
        this.componentRepository = componentRepository;
    }

    // Manufacturer adds a new component to the master catalog
    public Component addComponent(ComponentRequestDTO dto) {

        // Reject duplicate part numbers — must be unique across the catalog
        if (componentRepository.findByPartNumber(dto.getPartNumber()).isPresent()) {
            throw new RuntimeException("Component with part number already exists: " + dto.getPartNumber());
        }

        Component component = new Component();
        component.setName(dto.getName());
        component.setPartNumber(dto.getPartNumber());
        component.setCategory(dto.getCategory());
        component.setDescription(dto.getDescription());

        return componentRepository.save(component);
    }

    // Returns all components in the catalog
    public List<Component> getAllComponents() {
        return componentRepository.findAll();
    }

    // Fetch a single component by id — used internally by other services
    public Component getComponentById(Long id) {
        return componentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Component not found with id: " + id));
    }

    // Search by exact part number — used during BOM matching
    public Component searchByPartNumber(String partNumber) {
        System.out.println("service hit");
        return componentRepository.findByPartNumber(partNumber)
                .orElseThrow(() -> new RuntimeException("Component not found with part number: " + partNumber));
    }

    // Filter by category — used when manufacturer browses catalog
    // Returns a list of components matching a search keyword
    public List<Component> getByCategory(String category) {
        return componentRepository.findByCategory(category);
    }

    public List<Component> searchByKeyword(String keyword){
        return componentRepository.searchByKeyword(keyword);
    }

    // DTO Conversion Methods
    public ComponentResponseDTO toComponentResponseDTO(Component component) {
        return ComponentResponseDTO.builder()
                .id(component.getId())
                .name(component.getName())
                .partNumber(component.getPartNumber())
                .category(component.getCategory())
                .description(component.getDescription())
                .build();
    }

    public List<ComponentResponseDTO> toComponentResponseDTOs(List<Component> components) {
        return components.stream()
                .map(this::toComponentResponseDTO)
                .collect(Collectors.toList());
    }
}