// This file defines the auth API response models used by the mobile app
package edu.cit.monreal.petcareplus.network.models

data class AuthResponse(
    val success: Boolean? = null,
    val data: AuthData? = null,
    val error: ErrorData? = null,
    val timestamp: String? = null,
    val token: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val user: UserData? = null
)

data class AuthData(
    val accessToken: String,
    val refreshToken: String,
    val user: UserData
)

data class UserData(
    val email: String,
    val firstname: String? = null,
    val lastname: String? = null,
    val role: String? = null
)

data class ErrorData(
    val code: String? = null,
    val message: String? = null,
    val details: String? = null
)
