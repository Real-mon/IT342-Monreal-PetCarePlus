// This file renders the Registration screen UI and handles validation and submission
package edu.cit.monreal.petcareplus.ui.screens

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import edu.cit.monreal.petcareplus.network.models.RegisterRequest
import edu.cit.monreal.petcareplus.ui.theme.PetCareTeal
import edu.cit.monreal.petcareplus.ui.theme.TextGray
import edu.cit.monreal.petcareplus.viewmodel.RegisterViewModel
import androidx.compose.ui.tooling.preview.Preview
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    viewModel: RegisterViewModel = viewModel()
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("PET_OWNER") }
    var showPassword by remember { mutableStateOf(false) }
    var showConfirm by remember { mutableStateOf(false) }

    var firstErr by remember { mutableStateOf<String?>(null) }
    var lastErr by remember { mutableStateOf<String?>(null) }
    var emailErr by remember { mutableStateOf<String?>(null) }
    var passErr by remember { mutableStateOf<String?>(null) }
    var confirmErr by remember { mutableStateOf<String?>(null) }

    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val successMessage by viewModel.successMessage.collectAsState()

    fun validate(): Boolean {
        firstErr = if (firstName.isBlank()) "This field is required" else null
        lastErr = if (lastName.isBlank()) "This field is required" else null
        emailErr = when {
            email.isBlank() -> "This field is required"
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> "Please enter a valid email"
            else -> null
        }
        passErr = when {
            password.isBlank() -> "This field is required"
            password.length < 8 -> "Password must be at least 8 characters"
            else -> null
        }
        confirmErr = when {
            confirm.isBlank() -> "This field is required"
            confirm != password -> "Passwords do not match"
            else -> null
        }
        return listOf(firstErr, lastErr, emailErr, passErr, confirmErr).all { it == null }
    }

    fun submit(context: Context) {
        if (!validate()) return
        val req = RegisterRequest(
            firstname = firstName.trim(),
            lastname = lastName.trim(),
            email = email.trim(),
            password = password,
            role = role
        )
        viewModel.register(context, req) {
            scope.launch {
                delay(1500)
                onNavigateToLogin()
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("PetCare+", style = MaterialTheme.typography.headlineLarge, color = PetCareTeal)
        Text("Create your account", color = TextGray)
        Spacer(Modifier.height(16.dp))

        LabeledField("First Name") {
            OutlinedTextField(
                value = firstName, onValueChange = { firstName = it },
                modifier = Modifier.fillMaxWidth()
            )
        }
        ErrorText(firstErr)

        LabeledField("Last Name") {
            OutlinedTextField(
                value = lastName, onValueChange = { lastName = it },
                modifier = Modifier.fillMaxWidth()
            )
        }
        ErrorText(lastErr)

        LabeledField("Email") {
            OutlinedTextField(
                value = email, onValueChange = { email = it },
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth()
            )
        }
        ErrorText(emailErr)

        LabeledField("Password") {
            OutlinedTextField(
                value = password, onValueChange = { password = it },
                visualTransformation = if (showPassword) androidx.compose.ui.text.input.VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    Text(
                        if (showPassword) "Hide" else "Show",
                        modifier = Modifier.clickable { showPassword = !showPassword })
                },
                modifier = Modifier.fillMaxWidth()
            )
        }
        ErrorText(passErr)

        LabeledField("Confirm Password") {
            OutlinedTextField(
                value = confirm, onValueChange = { confirm = it },
                visualTransformation = if (showConfirm) androidx.compose.ui.text.input.VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    Text(
                        if (showConfirm) "Hide" else "Show",
                        modifier = Modifier.clickable { showConfirm = !showConfirm })
                },
                modifier = Modifier.fillMaxWidth()
            )
        }
        ErrorText(confirmErr)

        Spacer(Modifier.height(8.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            val petOwnerSelected = role == "PET_OWNER"
            val serviceProviderSelected = role == "SERVICE_PROVIDER"
            RoleButton(text = "Pet Owner", selected = petOwnerSelected, onClick = { role = "PET_OWNER" }, modifier = Modifier.weight(1f))
            RoleButton(text = "Service Provider", selected = serviceProviderSelected, onClick = { role = "SERVICE_PROVIDER" }, modifier = Modifier.weight(1f))
        }

        Spacer(Modifier.height(16.dp))
        Button(
            onClick = { submit(ctx) },
            enabled = !isLoading,
            modifier = Modifier.fillMaxWidth()
        ) { if (isLoading) CircularProgressIndicator() else Text("Create Account") }

        successMessage?.let { Text(it, color = edu.cit.monreal.petcareplus.ui.theme.SuccessGreen) }
        errorMessage?.let { Text(it, color = edu.cit.monreal.petcareplus.ui.theme.ErrorRed) }

        Spacer(Modifier.height(12.dp))
        Text(
            "Already have an account? Login",
            color = PetCareTeal,
            modifier = Modifier.clickable { onNavigateToLogin() }
        )
    }
}

@Composable
private fun LabeledField(label: String, content: @Composable () -> Unit) {
    Column(Modifier.fillMaxWidth()) {
        Text(label, style = MaterialTheme.typography.bodyMedium)
        Spacer(Modifier.height(6.dp))
        content()
    }
}

@Composable
private fun ErrorText(msg: String?) {
    if (!msg.isNullOrBlank()) {
        Text(msg, color = edu.cit.monreal.petcareplus.ui.theme.ErrorRed, style = MaterialTheme.typography.bodySmall)
    }
}

@Composable
private fun RoleButton(text: String, selected: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    if (selected) {
        Button(onClick = onClick, modifier = modifier) { Text(text) }
    } else {
        OutlinedButton(onClick = onClick, modifier = modifier) { Text(text) }
    }
}

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
