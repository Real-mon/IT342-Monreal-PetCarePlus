// This file routes to the correct dashboard (Pet Owner or Service Provider) based on stored role
package edu.cit.monreal.petcareplus.ui.screens

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import edu.cit.monreal.petcareplus.datastore.TokenDataStore
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme

@Composable
fun DashboardScreen(onLogout: () -> Unit) {
    val ctx = LocalContext.current
    var role by remember { mutableStateOf<String?>(null) }
    var email by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        val token = TokenDataStore.getToken(ctx)
        if (token.isNullOrBlank()) {
            onLogout()
            return@LaunchedEffect
        }
        role = TokenDataStore.getRole(ctx)
        email = TokenDataStore.getUserEmail(ctx)
    }

    val displayName = deriveNameFromEmail(email)

    when (role) {
        "SERVICE_PROVIDER" -> ServiceProviderDashboardScreen(displayName = displayName, onLogout = onLogout)
        "PET_OWNER" -> PetOwnerDashboardScreen(displayName = displayName, onLogout = onLogout)
        null -> Text("Loading…", modifier = Modifier)
        else -> PetOwnerDashboardScreen(displayName = displayName, onLogout = onLogout)
    }
}

private fun deriveNameFromEmail(email: String?): String {
    val localPart = email?.substringBefore('@')?.trim().orEmpty()
    if (localPart.isBlank()) return "there"
    return localPart.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
}

@Preview(showBackground = true)
@Composable
private fun DashboardScreenPreview() {
    PetCarePlusTheme {
        DashboardScreen(onLogout = {})
    }
}
