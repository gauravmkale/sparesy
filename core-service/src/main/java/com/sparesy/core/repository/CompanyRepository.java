package com.sparesy.core.repository;

import com.sparesy.core.entity.Company;
import com.sparesy.core.enums.CompanyType;
import com.sparesy.core.enums.OnboardingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByTypeAndIsActive(CompanyType type, Boolean isActive);
    List<Company> findByOnboardingStatusAndIsActive(OnboardingStatus status, Boolean isActive);
    boolean existsByEmail(String email);
    List<Company> findByTypeAndOnboardingStatusAndIsActive(CompanyType type, OnboardingStatus status, Boolean isActive);
}
