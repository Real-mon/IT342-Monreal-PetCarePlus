// This file defines the request body for login endpoint
package edu.cit.monreal.petcareplus.network.models

data class LoginRequest(
    val email: String,
    val password: String
)
