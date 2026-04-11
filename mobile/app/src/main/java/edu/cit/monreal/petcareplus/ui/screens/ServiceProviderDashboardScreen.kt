// This file shows the Service Provider dashboard UI in a scrollable mobile layout
package edu.cit.monreal.petcareplus.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import edu.cit.monreal.petcareplus.ui.theme.BorderGray
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme
import edu.cit.monreal.petcareplus.ui.theme.PetCareTeal
import edu.cit.monreal.petcareplus.ui.theme.TextDark
import edu.cit.monreal.petcareplus.ui.theme.TextGray

@Composable
fun ServiceProviderDashboardScreen(
    displayName: String,
    onLogout: () -> Unit
) {
    val (selectedTab, setSelectedTab) = remember { mutableStateOf("Home") }

    Column(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            HeaderRow(
                title = "Good morning!",
                subtitle = "Provider: $displayName",
                onLogout = onLogout
            )

            Spacer(Modifier.height(16.dp))

            StatsGrid(
                items = listOf(
                    DashboardStatItem("5", "New Requests"),
                    DashboardStatItem("3", "Today"),
                    DashboardStatItem("28", "This Month"),
                    DashboardStatItem("4.8", "Rating")
                )
            )

            Spacer(Modifier.height(20.dp))

            SectionTitle("Booking Requests")
            Spacer(Modifier.height(10.dp))

            RequestCard(
                customerName = "Juan Cruz",
                serviceName = "Full Grooming",
                dateTime = "Mar 3",
                onAccept = {},
                onDecline = {},
                onUpdateStatus = {}
            )
            Spacer(Modifier.height(12.dp))
            RequestCard(
                customerName = "Maria Santos",
                serviceName = "Vet Check-up",
                dateTime = "Mar 4",
                onAccept = {},
                onDecline = {},
                onUpdateStatus = {}
            )

            Spacer(Modifier.height(12.dp))
        }

        HorizontalDivider(color = BorderGray)
        NavigationBar {
            NavigationBarItem(
                selected = selectedTab == "Home",
                onClick = { setSelectedTab("Home") },
                icon = {},
                label = { Text("Home") }
            )
            NavigationBarItem(
                selected = selectedTab == "Requests",
                onClick = { setSelectedTab("Requests") },
                icon = {},
                label = { Text("Requests") }
            )
            NavigationBarItem(
                selected = selectedTab == "Schedule",
                onClick = { setSelectedTab("Schedule") },
                icon = {},
                label = { Text("Schedule") }
            )
            NavigationBarItem(
                selected = selectedTab == "Profile",
                onClick = { setSelectedTab("Profile") },
                icon = {},
                label = { Text("Profile") }
            )
        }
    }
}

@Composable
private fun HeaderRow(title: String, subtitle: String, onLogout: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = TextDark)
            Spacer(Modifier.height(2.dp))
            Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = TextGray)
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(PetCareTeal),
                contentAlignment = Alignment.Center
            ) {
                Text("USR", color = MaterialTheme.colorScheme.onPrimary, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.size(8.dp))
            TextButton(onClick = onLogout) {
                Text("Logout", color = PetCareTeal)
            }
        }
    }
}

@Composable
private fun StatsGrid(items: List<DashboardStatItem>) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            StatCard(items[0], Modifier.weight(1f))
            StatCard(items[1], Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            StatCard(items[2], Modifier.weight(1f))
            StatCard(items[3], Modifier.weight(1f))
        }
    }
}

@Composable
private fun StatCard(item: DashboardStatItem, modifier: Modifier) {
    Card(
        modifier = modifier.height(90.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, BorderGray)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(item.value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(4.dp))
            Text(item.label, color = TextGray, style = MaterialTheme.typography.bodySmall)
        }
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(text, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = TextDark)
}

@Composable
private fun RequestCard(
    customerName: String,
    serviceName: String,
    dateTime: String,
    onAccept: () -> Unit,
    onDecline: () -> Unit,
    onUpdateStatus: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, BorderGray)
    ) {
        Column(modifier = Modifier.fillMaxWidth().padding(12.dp)) {
            Text(customerName, fontWeight = FontWeight.Bold, color = TextDark)
            Spacer(Modifier.height(2.dp))
            Text(serviceName, color = TextGray, style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.height(2.dp))
            Text(dateTime, color = TextGray, style = MaterialTheme.typography.bodySmall)

            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = onAccept,
                    colors = ButtonDefaults.buttonColors(containerColor = PetCareTeal),
                    modifier = Modifier.weight(1f).height(42.dp)
                ) { Text("Accept") }
                OutlinedButton(
                    onClick = onDecline,
                    modifier = Modifier.weight(1f).height(42.dp)
                ) { Text("Decline") }
            }
            Spacer(Modifier.height(10.dp))
            OutlinedButton(
                onClick = onUpdateStatus,
                modifier = Modifier.fillMaxWidth().height(42.dp)
            ) { Text("Update Status") }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun ProviderDashboardPreview() {
    PetCarePlusTheme {
        ServiceProviderDashboardScreen(displayName = "Pass & Class", onLogout = {})
    }
}
