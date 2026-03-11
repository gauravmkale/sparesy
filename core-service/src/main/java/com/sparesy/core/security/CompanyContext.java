package com.sparesy.core.security;

import com.sparesy.core.enums.CompanyType;

/*
 * CompanyContext
 * Stores information about the currently authenticated company (companyId and companyType)
 * during a single HTTP request so any layer (controller, service, repository) can access it
 * without passing parameters through every method.
 *
 * In a Spring Boot server, each HTTP request is handled by a thread from a thread pool.
 * Multiple requests run simultaneously on different threads.
 *
 * ThreadLocal gives each thread its own isolated variable:
 *
 *      Thread A -> companyId = 5
 *      Thread B -> companyId = 12
 *      Thread C -> companyId = 7
 *
 * Even though the variable is static, the values are NOT shared across threads.
 *
 * Threads in servers are reused. If we do not clear ThreadLocal values, the next request
 * handled by the same thread might accidentally see the previous company's data.

 */
public class CompanyContext {

    // ThreadLocal means each request thread has its own copy —
    // no two requests can read each other's companyId
    private static final ThreadLocal<Long> companyIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<CompanyType> companyTypeHolder = new ThreadLocal<>();

    // Called by JwtFilter after validating the token
    public static void setCurrentCompanyId(Long companyId) {
        companyIdHolder.set(companyId);
    }

    public static void setCurrentCompanyType(CompanyType companyType) {
        companyTypeHolder.set(companyType);
    }

    // Called by any service method that needs to know who is making the request
    public static Long getCurrentCompanyId() {
        return companyIdHolder.get();
    }

    public static CompanyType getCurrentCompanyType() {
        return companyTypeHolder.get();
    }

    // MUST be called at the end of every request to prevent memory leaks —
    // threads are reused in a thread pool, so old values persist if not cleared
    public static void clear() {
        companyIdHolder.remove();
        companyTypeHolder.remove();
    }
}
