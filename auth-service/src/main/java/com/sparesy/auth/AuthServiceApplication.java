package com.sparesy.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthServiceApplication{
    //This is the entry point of the auth service. 
    // Spring boot starts
    //1. Starts an embedded Tomcat server on port 8081
    //2. Will scan all classes under com.sparesy.auth
    //3. Will set up database connection,security everything automatically.

    public static void main(String[] args){
        SpringApplication.run(AuthServiceApplication.class,args);
    }
}
