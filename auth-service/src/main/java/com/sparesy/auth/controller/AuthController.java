package com.sparesy.auth.controller;

import com.sparesy.auth.dto.LoginRequest;
import com.sparesy.auth.dto.LoginResponse;
import com.sparesy.auth.dto.RegisterRequest;
import com.sparesy.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Void> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(201).build();
    }
}