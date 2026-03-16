package com.sparesy.core.repository;

import com.sparesy.core.entity.Company;
import com.sparesy.core.enums.CompanyType;
import com.sparesy.core.enums.OnboardingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByType(CompanyType type);
    List<Company> findByOnboardingStatus(OnboardingStatus status);
    boolean existsByEmail(String email);
}