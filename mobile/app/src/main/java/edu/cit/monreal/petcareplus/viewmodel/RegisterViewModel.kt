// This file implements registration logic using MVVM and coroutines
package edu.cit.monreal.petcareplus.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.monreal.petcareplus.network.RetrofitClient
import edu.cit.monreal.petcareplus.network.models.RegisterRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class RegisterViewModel : ViewModel() {
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage

    private val _successMessage = MutableStateFlow<String?>(null)
    val successMessage: StateFlow<String?> = _successMessage

    fun register(context: Context, request: RegisterRequest, onSuccess: () -> Unit) {
        _errorMessage.value = null
        _successMessage.value = null
        _isLoading.value = true
        viewModelScope.launch {
            try {
                val api = RetrofitClient.create(context)
                val res = api.register(request)
                if (res.isSuccessful) {
                    val body = res.body()
                    if (body?.success == true) {
                        _successMessage.value = "Registration successful! Redirecting..."
                        onSuccess()
                    } else {
                        val code = body?.error?.code
                        _errorMessage.value = if (code == "DB-002") {
                            "This email is already registered"
                        } else {
                            "Something went wrong. Please try again."
                        }
                    }
                } else {
                    _errorMessage.value = "Something went wrong. Please try again."
                }
            } catch (e: Exception) {
                _errorMessage.value = "Something went wrong. Please try again."
            } finally {
                _isLoading.value = false
            }
        }
    }
}
