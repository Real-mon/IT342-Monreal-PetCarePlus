// This file renders the mobile Register page using PetCare Plus brand colors
package edu.cit.monreal.petcareplus.ui.screens

import android.util.Patterns
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import edu.cit.monreal.petcareplus.network.models.RegisterRequest
import edu.cit.monreal.petcareplus.ui.theme.ErrorRed
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme
import edu.cit.monreal.petcareplus.ui.theme.PetCareTeal
import edu.cit.monreal.petcareplus.ui.theme.SuccessGreen
import edu.cit.monreal.petcareplus.ui.theme.TextGray
import edu.cit.monreal.petcareplus.viewmodel.RegisterViewModel
import kotlinx.coroutines.delay

@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    viewModel: RegisterViewModel = viewModel()
) {
    val ctx = LocalContext.current
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("PET_OWNER") }
    var showPassword by remember { mutableStateOf(false) }
    var showConfirm by remember { mutableStateOf(false) }

    var firstNameErr by remember { mutableStateOf<String?>(null) }
    var lastNameErr by remember { mutableStateOf<String?>(null) }
    var emailErr by remember { mutableStateOf<String?>(null) }
    var passwordErr by remember { mutableStateOf<String?>(null) }
    var confirmErr by remember { mutableStateOf<String?>(null) }

    fun validate(): Boolean {
        firstNameErr = if (firstName.isBlank()) "This field is required" else null
        lastNameErr = if (lastName.isBlank()) "This field is required" else null
        emailErr = when {
            email.isBlank() -> "This field is required"
            !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Please enter a valid email"
            else -> null
        }
        passwordErr = when {
            password.isBlank() -> "This field is required"
            password.length < 8 -> "Password must be at least 8 characters"
            else -> null
        }
        confirmErr = when {
            confirmPassword.isBlank() -> "This field is required"
            confirmPassword != password -> "Passwords do not match"
            else -> null
        }
        return listOf(firstNameErr, lastNameErr, emailErr, passwordErr, confirmErr).all { it == null }
    }

    val isLoading = viewModel.isLoading
    val errorMessage = viewModel.errorMessage
    val successMessage = viewModel.successMessage

    LaunchedEffect(successMessage) {
        if (!successMessage.isNullOrBlank()) {
            delay(1500)
            onNavigateToLogin()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("PetCare+", style = MaterialTheme.typography.headlineLarge, color = PetCareTeal)
        Spacer(Modifier.height(6.dp))
        Text("Create your account", color = TextGray)
        Spacer(Modifier.height(20.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = firstName,
                onValueChange = { firstName = it },
                label = { Text("First Name") },
                singleLine = true,
                colors = tealFieldColors(),
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = lastName,
                onValueChange = { lastName = it },
                label = { Text("Last Name") },
                singleLine = true,
                colors = tealFieldColors(),
                modifier = Modifier.weight(1f)
            )
        }
        FieldError(firstNameErr)
        FieldError(lastNameErr)

        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true,
            colors = tealFieldColors(),
            modifier = Modifier.fillMaxWidth()
        )
        FieldError(emailErr)

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
            colors = tealFieldColors(),
            modifier = Modifier.fillMaxWidth()
        )
        FieldError(passwordErr)

        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = { Text("Confirm Password") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            singleLine = true,
            visualTransformation = if (showConfirm) VisualTransformation.None else PasswordVisualTransformation(),
            trailingIcon = {
                IconButton(onClick = { showConfirm = !showConfirm }) {
                    Icon(
                        imageVector = if (showConfirm) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                        contentDescription = "Toggle confirm password visibility"
                    )
                }
            },
            colors = tealFieldColors(),
            modifier = Modifier.fillMaxWidth()
        )
        FieldError(confirmErr)

        Spacer(Modifier.height(14.dp))
        Text("Role", modifier = Modifier.align(Alignment.Start), color = TextGray)
        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            RoleButton(
                text = "Pet Owner",
                selected = role == "PET_OWNER",
                onClick = { role = "PET_OWNER" },
                modifier = Modifier.weight(1f)
            )
            RoleButton(
                text = "Service Provider",
                selected = role == "SERVICE_PROVIDER",
                onClick = { role = "SERVICE_PROVIDER" },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(Modifier.height(18.dp))
        Button(
            onClick = {
                if (!validate()) return@Button
                viewModel.register(
                    context = ctx,
                    request = RegisterRequest(
                        firstname = firstName.trim(),
                        lastname = lastName.trim(),
                        email = email.trim(),
                        password = password,
                        role = role
                    )
                )
            },
            enabled = !isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = PetCareTeal),
            modifier = Modifier.fillMaxWidth()
        ) {
            if (isLoading) {
                CircularProgressIndicator()
            } else {
                Text("Create Account")
            }
        }

        if (!successMessage.isNullOrBlank()) {
            Spacer(Modifier.height(10.dp))
            Text(successMessage, color = SuccessGreen)
        }
        if (!errorMessage.isNullOrBlank()) {
            Spacer(Modifier.height(10.dp))
            Text(errorMessage, color = ErrorRed)
        }

        Spacer(Modifier.height(16.dp))
        Text(
            text = "Already have an account? Login",
            color = PetCareTeal,
            modifier = Modifier.clickable { onNavigateToLogin() }
        )
    }
}

@Composable
private fun FieldError(text: String?) {
    if (!text.isNullOrBlank()) {
        Text(text, color = ErrorRed, style = MaterialTheme.typography.bodySmall, modifier = Modifier.fillMaxWidth())
    }
}

@Composable
private fun RoleButton(text: String, selected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    if (selected) {
        Button(
            onClick = onClick,
            colors = ButtonDefaults.buttonColors(containerColor = PetCareTeal),
            modifier = modifier
        ) { Text(text) }
    } else {
        OutlinedButton(onClick = onClick, modifier = modifier) { Text(text, color = PetCareTeal) }
    }
}

@Composable
private fun tealFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = PetCareTeal,
    focusedLabelColor = PetCareTeal,
    cursorColor = PetCareTeal
)

@Preview(showBackground = true)
@Composable
private fun RegisterScreenPreview() {
    PetCarePlusTheme {
        RegisterScreen(
            onNavigateToLogin = {},
            viewModel = RegisterViewModel()
        )
    }
}
