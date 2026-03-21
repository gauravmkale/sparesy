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

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public List<Company> getAllClients() {
        return companyRepository.findByTypeAndIsActive(CompanyType.CLIENT, true);
    }

    public List<Company> getAllApprovedClients() {
        return companyRepository.findByTypeAndOnboardingStatusAndIsActive(CompanyType.CLIENT, OnboardingStatus.APPROVED, true);
    }

    public List<Company> getAllSuppliers() {
        return companyRepository.findByTypeAndIsActive(CompanyType.SUPPLIER, true);
    }

    public List<Company> getAllApprovedSuppliers() {
        return companyRepository.findByTypeAndOnboardingStatusAndIsActive(CompanyType.SUPPLIER, OnboardingStatus.APPROVED, true);
    }

    public List<Company> getPendingCompanies() {
        return companyRepository.findByOnboardingStatusAndIsActive(OnboardingStatus.PENDING, true);
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

    public void deleteCompany(Long id) {
        Company company = getCompanyById(id);
        company.setIsActive(false);
        companyRepository.save(company);
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    }
}
