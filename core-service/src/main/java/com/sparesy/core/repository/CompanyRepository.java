package com.sparesy.core.repository;

import com.sparesy.core.entity.Company;
import com.sparesy.core.enums.CompanyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByType(CompanyType type);
    boolean existsByEmail(String email);
}