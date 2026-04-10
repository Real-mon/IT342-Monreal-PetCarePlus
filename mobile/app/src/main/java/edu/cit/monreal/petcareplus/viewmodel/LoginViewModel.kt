// This file holds login UI state and performs the login API call using MVVM
package edu.cit.monreal.petcareplus.viewmodel

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import edu.cit.monreal.petcareplus.datastore.TokenDataStore
import edu.cit.monreal.petcareplus.network.RetrofitClient
import edu.cit.monreal.petcareplus.network.models.LoginRequest
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {
    var isLoading by mutableStateOf(false)
        private set

    var errorMessage by mutableStateOf<String?>(null)
        private set

    fun login(context: Context, request: LoginRequest, onSuccess: () -> Unit) {
        errorMessage = null
        isLoading = true
        viewModelScope.launch {
            try {
                val api = RetrofitClient.api(context)
                val res = api.login(request)
                val body = res.body()
                val token = body?.data?.accessToken ?: body?.accessToken ?: body?.token
                val role = body?.data?.user?.role ?: body?.user?.role
                val email = body?.data?.user?.email ?: body?.user?.email
                if (res.isSuccessful && !token.isNullOrBlank()) {
                    TokenDataStore.saveToken(context, token)
                    if (!role.isNullOrBlank()) TokenDataStore.saveRole(context, role)
                    if (!email.isNullOrBlank()) TokenDataStore.saveUserEmail(context, email)
                    onSuccess()
                } else {
                    errorMessage = "Invalid email or password. Please try again."
                }
            } catch (e: Exception) {
                errorMessage = "Invalid email or password. Please try again."
            } finally {
                isLoading = false
            }
        }
    }
}
