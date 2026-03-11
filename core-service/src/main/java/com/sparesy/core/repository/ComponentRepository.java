package com.sparesy.core.repository;

import com.sparesy.core.entity.Component;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComponentRepository extends JpaRepository<Component, Long> {
    Optional<Component> findByPartNumber(String partNumber);
    List<Component> findByCategory(String category);
}