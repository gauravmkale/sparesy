package com.sparesy.auth.enums;

// This enum defines the three types of companies in the system.
// We store it as a STRING in MySQL (e.g. "MANUFACTURER")
// not as a number (0, 1, 2) so the database is human-readable.
public enum CompanyType {
    MANUFACTURER,
    CLIENT,
    SUPPLIER
}