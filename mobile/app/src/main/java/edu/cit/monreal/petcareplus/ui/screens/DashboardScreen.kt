// This file renders the Dashboard screen with welcome info and logout behavior
package edu.cit.monreal.petcareplus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import edu.cit.monreal.petcareplus.datastore.TokenDataStore
import edu.cit.monreal.petcareplus.ui.theme.PetCareTeal
import edu.cit.monreal.petcareplus.ui.theme.TextGray
import kotlinx.coroutines.launch
import androidx.compose.ui.tooling.preview.Preview
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme

@Composable
fun DashboardScreen(
    onLogout: () -> Unit
) {
    val ctx = LocalContext.current
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf<String?>(null) }
    var role by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        val token = TokenDataStore.getToken(ctx)
        if (token.isNullOrBlank()) {
            onLogout()
        } else {
            email = TokenDataStore.getUserEmail(ctx)
            role = TokenDataStore.getRole(ctx)
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).padding(24.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("PetCare Plus", style = MaterialTheme.typography.titleLarge)
            TextButton(onClick = {
                scope.launch {
                    TokenDataStore.clearAll(ctx)
                    onLogout()
                }
            }) { Text("Logout", color = PetCareTeal) }
        }
        Spacer(Modifier.height(16.dp))
        Text("Welcome back!", style = MaterialTheme.typography.headlineMedium)
        email?.let { Text(it, color = TextGray) }
        role?.let {
            Box(
                modifier = Modifier.padding(top = 8.dp).background(PetCareTeal, shape = MaterialTheme.shapes.small).padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(if (it == "SERVICE_PROVIDER") "Service Provider" else "Pet Owner", color = MaterialTheme.colorScheme.onPrimary)
            }
        }
        Spacer(Modifier.height(32.dp))
        Button(onClick = {}, modifier = Modifier.fillMaxWidth()) {
            Text("Book a Service")
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun DashboardScreenPreview() {
    PetCarePlusTheme {
        DashboardScreen(onLogout = {})
    }
}
