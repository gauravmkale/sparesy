package com.sparesy.auth.model;

import com.sparesy.auth.enums.CompanyType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invitations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanyType type;

    @Column(nullable = false, unique = true)
    private String token;

    @Builder.Default
    private Boolean used = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // Token expires in 7 days
    @Builder.Default
    private LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

    @PrePersist
    public void generateToken() {
        if (this.token == null) {
            this.token = UUID.randomUUID().toString();
        }
    }
}
