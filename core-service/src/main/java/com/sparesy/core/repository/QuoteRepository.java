package com.sparesy.core.repository;

import com.sparesy.core.entity.Quote;
import com.sparesy.core.enums.QuoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    Optional<Quote> findByProjectId(Long projectId);
    List<Quote> findByStatus(QuoteStatus status);
}