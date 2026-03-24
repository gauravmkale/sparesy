package com.sparesy.core.repository;

import com.sparesy.core.entity.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ComponentRepository extends JpaRepository<Component, Long> {
    Optional<Component> findByPartNumber(String partNumber);
    List<Component> findByCategory(String category);
    boolean existsByPartNumber(String partNumber);

    //New - case-insensitive  partial match on both name and part number
    @Query("SELECT c FROM Component c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.partNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Component> searchByKeyword(@Param("keyword") String keyword);
}