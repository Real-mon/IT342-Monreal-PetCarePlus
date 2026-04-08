// This file renders the Login screen UI and triggers the login ViewModel logic
package edu.cit.monreal.petcareplus.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import edu.cit.monreal.petcareplus.ui.theme.PetCareTeal
import edu.cit.monreal.petcareplus.ui.theme.TextGray
import edu.cit.monreal.petcareplus.viewmodel.LoginViewModel
import edu.cit.monreal.petcareplus.network.models.LoginRequest
import androidx.compose.ui.tooling.preview.Preview
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme

@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    onLoginSuccess: () -> Unit,
    viewModel: LoginViewModel = viewModel()
) {
    val ctx = LocalContext.current
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("PetCare+", style = MaterialTheme.typography.headlineLarge, color = PetCareTeal)
        Text("Welcome back — please sign in", color = TextGray)
        Spacer(Modifier.height(16.dp))

        OutlinedTextField(
            value = email, onValueChange = { email = it },
            keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = password, onValueChange = { password = it },
            visualTransformation = if (showPassword) androidx.compose.ui.text.input.VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = { Text(if (showPassword) "Hide" else "Show", modifier = Modifier.clickable { showPassword = !showPassword }) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(16.dp))
        Button(
            onClick = {
                viewModel.login(ctx, LoginRequest(email.trim(), password)) {
                    onLoginSuccess()
                }
            },
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) CircularProgressIndicator() else Text("Login")
        }
        errorMessage?.let { Text(it, color = edu.cit.monreal.petcareplus.ui.theme.ErrorRed) }
        Spacer(Modifier.height(12.dp))
        Text(
            "Don't have an account? Register here",
            color = PetCareTeal,
            modifier = Modifier.clickable { onNavigateToRegister() }
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun LoginScreenPreview() {
    PetCarePlusTheme {
        LoginScreen(
            onNavigateToRegister = {},
            onLoginSuccess = {},
            viewModel = LoginViewModel()
        )
    }
}
