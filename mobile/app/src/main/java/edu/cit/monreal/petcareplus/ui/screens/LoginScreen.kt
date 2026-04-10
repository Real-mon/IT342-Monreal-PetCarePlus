// This file renders the mobile Login page using PetCare Plus brand colors
package edu.cit.monreal.petcareplus.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import edu.cit.monreal.petcareplus.network.models.LoginRequest
import edu.cit.monreal.petcareplus.ui.theme.ErrorRed
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme
import edu.cit.monreal.petcareplus.ui.theme.PetCareTeal
import edu.cit.monreal.petcareplus.ui.theme.TextGray
import edu.cit.monreal.petcareplus.viewmodel.LoginViewModel

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

    val isLoading = viewModel.isLoading
    val errorMessage = viewModel.errorMessage

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "PetCare+",
            style = MaterialTheme.typography.headlineLarge,
            color = PetCareTeal
        )
        Spacer(Modifier.height(6.dp))
        Text("Welcome back — please sign in", color = TextGray)
        Spacer(Modifier.height(20.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = PetCareTeal,
                focusedLabelColor = PetCareTeal,
                cursorColor = PetCareTeal
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(12.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            singleLine = true,
            visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                IconButton(onClick = { showPassword = !showPassword }) {
                    Icon(
                        imageVector = if (showPassword) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                        contentDescription = "Toggle password visibility"
                    )
                }
            },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = PetCareTeal,
                focusedLabelColor = PetCareTeal,
                cursorColor = PetCareTeal
            ),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = {
                viewModel.login(
                    context = ctx,
                    request = LoginRequest(email = email.trim(), password = password),
                    onSuccess = onLoginSuccess
                )
            },
            enabled = !isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = PetCareTeal),
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) {
                CircularProgressIndicator()
            } else {
                Text("Login")
            }
        }

        if (!errorMessage.isNullOrBlank()) {
            Spacer(Modifier.height(10.dp))
            Text(errorMessage, color = ErrorRed)
        }

        Spacer(Modifier.height(16.dp))
        Text(
            text = "Don't have an account? Register here",
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
