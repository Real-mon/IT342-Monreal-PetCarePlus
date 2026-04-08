// This file defines the data classes for the auth API response payload
package edu.cit.monreal.petcareplus.network.models

data class AuthResponse(
    val success: Boolean,
    val data: AuthData?,
    val error: ErrorData?,
    val timestamp: String?
)

data class AuthData(
    val accessToken: String,
    val refreshToken: String,
    val user: UserData
)

data class UserData(
    val email: String,
    val firstname: String,
    val lastname: String,
    val role: String
)

data class ErrorData(
    val code: String,
    val message: String,
    val details: String?
)
