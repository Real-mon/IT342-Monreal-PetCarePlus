// This file declares the Retrofit API endpoints for registration and login
package edu.cit.monreal.petcareplus.network

import edu.cit.monreal.petcareplus.network.models.AuthResponse
import edu.cit.monreal.petcareplus.network.models.LoginRequest
import edu.cit.monreal.petcareplus.network.models.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface ApiService {
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
}
