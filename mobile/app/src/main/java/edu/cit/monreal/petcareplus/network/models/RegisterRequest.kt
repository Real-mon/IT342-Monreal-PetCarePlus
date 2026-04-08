// This file defines the request body for registration endpoint
package edu.cit.monreal.petcareplus.network.models

data class RegisterRequest(
    val firstname: String,
    val lastname: String,
    val email: String,
    val password: String,
    val role: String // "PET_OWNER" or "SERVICE_PROVIDER"
)
