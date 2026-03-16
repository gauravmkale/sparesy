package com.sparesy.core.service;

import com.sparesy.core.entity.Company;
import com.sparesy.core.enums.CompanyType;
import com.sparesy.core.enums.OnboardingStatus;
import com.sparesy.core.repository.CompanyRepository;
import com.sparesy.core.websocket.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    @Autowired
    private NotificationService notificationService;

    private final CompanyRepository companyRepository;

    // Constructor injection — no @Autowired needed in modern Spring
    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    // Returns all companies of type CLIENT — used by manufacturer portal
    public List<Company> getAllClients() {
        return companyRepository.findByType(CompanyType.CLIENT);
    }

    // Returns all companies of type SUPPLIER — used by manufacturer portal
    public List<Company> getAllSuppliers() {
        return companyRepository.findByType(CompanyType.SUPPLIER);
    }

    public List<Company> getPendingCompanies() {
        return companyRepository.findByOnboardingStatus(OnboardingStatus.PENDING);
    }

    public void approveCompany(Long id) {
        Company company = getCompanyById(id);
        company.setOnboardingStatus(OnboardingStatus.APPROVED);
        companyRepository.save(company);

        notificationService.push(company.getId(), "ONBOARDING_APPROVED");
    }

    public void rejectCompany(Long id) {
        Company company = getCompanyById(id);
        company.setOnboardingStatus(OnboardingStatus.REJECTED);
        companyRepository.save(company);

        notificationService.push(company.getId(), "ONBOARDING_REJECTED");
    }

    // Returns a single company by id — used internally by other services
    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    }
}