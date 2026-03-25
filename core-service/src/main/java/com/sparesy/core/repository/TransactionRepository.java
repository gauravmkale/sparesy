package com.sparesy.core.repository;

import com.sparesy.core.entity.Transaction;
import com.sparesy.core.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCompanyId(Long companyId);
    List<Transaction> findByCompanyIdAndType(Long companyId, TransactionType type);

    // Sum all transactions for a company by type — used by revenue dashboards 
    // Spring Data can't infer a SUM from a method name so we write it explicitly in JPQL. 
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.company.id = :companyId AND t.type = :type")
    BigDecimal sumAmountByCompanyIdAndType(Long companyId, TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.project.id = :projectId AND t.type = :type")
    BigDecimal sumAmountByProjectIdAndType(Long projectId, TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.project.client.id = :clientId AND t.type = :type")
    BigDecimal sumAmountByClientIdAndType(Long clientId, TransactionType type);
}