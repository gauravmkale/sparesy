package com.sparesy.core.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sparesy.core.enums.CompanyType;
import com.sparesy.core.enums.OnboardingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Getter
@Setter
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CompanyType type;

    @Column(length = 6)
    private String pinCode;

    @Column(length = 10)
    private String contactNumber;

    @Column(unique = true, length = 15)
    private String gstNumber;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String contactPersonName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OnboardingStatus onboardingStatus = OnboardingStatus.PENDING;

    @Column(nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}