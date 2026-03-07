package com.sparesy.auth.repository;

import com.sparesy.auth.enums.CompanyType;
import com.sparesy.auth.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

//@Repository tells spring This class accesses database

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    
    //Optional means the result might be empty - no exception if not found.
    //findByEmail function implementation is automatically created at runtime by JPA
    //It creates a runtime proxy class that implements it.
    Optional<Company> findByEmail(String email);

    Optional<Company> findByGstNumber(String gstNumber);

    List<Company> findByType(CompanyType type);

}
