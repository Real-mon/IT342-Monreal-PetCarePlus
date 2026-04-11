// This file holds registration UI state and performs the register API call using MVVM
package edu.cit.monreal.petcareplus.viewmodel

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson
import edu.cit.monreal.petcareplus.network.RetrofitClient
import edu.cit.monreal.petcareplus.network.models.AuthResponse
import edu.cit.monreal.petcareplus.network.models.RegisterRequest
import kotlinx.coroutines.launch

class RegisterViewModel : ViewModel() {
    var isLoading by mutableStateOf(false)
        private set

    var errorMessage by mutableStateOf<String?>(null)
        private set

    var successMessage by mutableStateOf<String?>(null)
        private set

    fun register(context: Context, request: RegisterRequest) {
        errorMessage = null
        successMessage = null
        isLoading = true
        viewModelScope.launch {
            try {
                val api = RetrofitClient.api(context)
                val res = api.register(request)
                val body = res.body()

                if (res.isSuccessful && body?.success == true) {
                    successMessage = "Registration successful! Redirecting..."
                    return@launch
                }

                val parsedError = parseErrorBody(res.errorBody()?.string())
                val errorCode = parsedError?.error?.code
                errorMessage = when (errorCode) {
                    "DB-002" -> "This email is already registered"
                    "VALID-001" -> "Please check your inputs and try again."
                    else -> "Something went wrong. Please try again."
                }
            } catch (e: Exception) {
                errorMessage = "Something went wrong. Please try again."
            } finally {
                isLoading = false
            }
        }
    }

    private fun parseErrorBody(raw: String?): AuthResponse? {
        if (raw.isNullOrBlank()) return null
        return try {
            Gson().fromJson(raw, AuthResponse::class.java)
        } catch (_: Exception) {
            null
        }
    }
}
