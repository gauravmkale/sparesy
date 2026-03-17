package com.sparesy.auth.model;

import com.sparesy.auth.enums.CompanyType;
import com.sparesy.auth.enums.OnboardingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    // Primary key — MySQL  auto-increments this
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Company name — required, max 100 characters
    @Column(nullable = false, length = 100)
    private String name;

    // Email must be unique across all companies
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    // Password will be stored as a BCrypt hash
    @JsonIgnore
    @Column(nullable = false, length = 255)
    private String password;

    // Stored as VARCHAR in MySQL e.g. "MANUFACTURER", "CLIENT", "SUPPLIER"
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CompanyType type;

    @Column(nullable =false, length =6)
    private String pinCode;

    @Column(nullable = false,length =10)
    private String contactNumber;

    @Column(nullable = false, length = 15, unique =true)
    private String gstNumber;

    @Column(nullable = false, length =255)
    private String address;

    @Column(nullable = false, length = 100)
    private String contactPersonName;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private OnboardingStatus onboardingStatus = OnboardingStatus.PENDING;

    // Soft enable/disable — manufacturer can deactivate a company
    // MySQL stores this as TINYINT(1) — true=1, false=0
    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    // Set automatically by Hibernate when the row is first created
    // updatable = false means this never changes after creation
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}