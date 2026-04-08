// This file implements login logic using MVVM and saves auth data in DataStore
package edu.cit.monreal.petcareplus.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.monreal.petcareplus.datastore.TokenDataStore
import edu.cit.monreal.petcareplus.network.RetrofitClient
import edu.cit.monreal.petcareplus.network.models.LoginRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage

    fun login(context: Context, request: LoginRequest, onSuccess: () -> Unit) {
        _errorMessage.value = null
        _isLoading.value = true
        viewModelScope.launch {
            try {
                val api = RetrofitClient.create(context)
                val res = api.login(request)
                if (res.isSuccessful) {
                    val body = res.body()
                    val accessToken = body?.data?.accessToken
                    val role = body?.data?.user?.role
                    val email = body?.data?.user?.email
                    if (!accessToken.isNullOrBlank()) {
                        TokenDataStore.saveToken(context, accessToken)
                        if (!role.isNullOrBlank()) TokenDataStore.saveRole(context, role)
                        if (!email.isNullOrBlank()) TokenDataStore.saveUserEmail(context, email)
                        onSuccess()
                    } else {
                        _errorMessage.value = "Invalid email or password. Please try again."
                    }
                } else {
                    _errorMessage.value = "Invalid email or password. Please try again."
                }
            } catch (e: Exception) {
                _errorMessage.value = "Invalid email or password. Please try again."
            } finally {
                _isLoading.value = false
            }
        }
    }
}
