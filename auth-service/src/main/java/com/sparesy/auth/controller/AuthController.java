package com.sparesy.auth.controller;

import com.sparesy.auth.dto.CompanyResponse;
import com.sparesy.auth.dto.LoginRequest;
import com.sparesy.auth.dto.LoginResponse;
import com.sparesy.auth.dto.RegisterRequest;
import com.sparesy.auth.dto.UpdateCompanyRequest;
import com.sparesy.auth.enums.CompanyType;
import com.sparesy.auth.model.Company;
import com.sparesy.auth.model.Invitation;
import com.sparesy.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// @RestController = @Controller + @ResponseBody
// means every method automatically converts return value to JSON
// @RequestMapping sets the base URL for all endpoints in this class
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Inject the service — same pattern as service injecting repository
    @Autowired
    private AuthService authService;

    // POST /api/auth/login
    // @RequestBody tells Spring to read the JSON body and convert it
    // to a LoginRequest object automatically
    // ResponseEntity lets you control the HTTP status code in the response
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response); // 200 OK
    }

    // POST /api/auth/register
    // Only the manufacturer admin calls this to create new accounts
    // Returns 201 Created on success
    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(201).build();
    }

    // POST /api/auth/invite
    @PostMapping("/invite")
    public ResponseEntity<String> invite(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        CompanyType type = CompanyType.valueOf(request.get("type"));
        String token = authService.createInvitation(email, type);
        return ResponseEntity.ok(token);
    }

    // GET /api/auth/invite/validate?token=xyz
    @GetMapping("/invite/validate")
    public ResponseEntity<Invitation> validateInvitation(@RequestParam String token) {
        return ResponseEntity.ok(authService.validateInvitation(token));
    }
    // GET /api/auth/companies/{id}
    @GetMapping("/companies/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        Company company = authService.getCompanyById(id);
        return ResponseEntity.ok(new CompanyResponse(company));
    }

    // PUT /api/auth/companies/{id}
    @PutMapping("/companies/{id}")
    public ResponseEntity<Void> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCompanyRequest request) {
        authService.updateCompany(id, request);
        return ResponseEntity.ok().build();
    }

    // PUT /api/auth/companies/{id}/deactivate
    @PutMapping("/companies/{id}/deactivate")
    public ResponseEntity<Void> deactivateCompany(@PathVariable Long id) {
        authService.deactivateCompany(id);
        return ResponseEntity.ok().build();
    }
}