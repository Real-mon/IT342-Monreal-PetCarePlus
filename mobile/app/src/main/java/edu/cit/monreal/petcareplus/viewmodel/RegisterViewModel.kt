// This file holds registration UI state and performs the register API call using MVVM
package edu.cit.monreal.petcareplus.viewmodel

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.monreal.petcareplus.network.RetrofitClient
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
                if (res.isSuccessful) {
                    val code = body?.error?.code
                    if (body?.success == true || code == null) {
                        successMessage = "Registration successful! Redirecting..."
                    } else if (code == "DB-002") {
                        errorMessage = "This email is already registered"
                    } else {
                        errorMessage = "Something went wrong. Please try again."
                    }
                } else {
                    errorMessage = "Something went wrong. Please try again."
                }
            } catch (e: Exception) {
                errorMessage = "Something went wrong. Please try again."
            } finally {
                isLoading = false
            }
        }
    }
}
