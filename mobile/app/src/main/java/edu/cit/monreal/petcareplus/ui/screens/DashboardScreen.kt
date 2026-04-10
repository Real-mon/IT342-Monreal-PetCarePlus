// This file renders a simple dashboard screen after login
package edu.cit.monreal.petcareplus.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme
import edu.cit.monreal.petcareplus.ui.theme.PetCareTeal
import edu.cit.monreal.petcareplus.ui.theme.TextGray

@Composable
fun DashboardScreen(onLogout: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("PetCare Plus", style = MaterialTheme.typography.titleLarge)
            TextButton(onClick = onLogout) {
                Text("Logout", color = PetCareTeal)
            }
        }
        Spacer(Modifier.height(24.dp))
        Text("Welcome back!", style = MaterialTheme.typography.headlineMedium)
        Text("You are logged in.", color = TextGray)
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
