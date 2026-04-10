// This file is the Android entry point and shows the Login/Register flow using Compose Navigation
package edu.cit.monreal.petcareplus

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import edu.cit.monreal.petcareplus.navigation.AppNavigation
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PetCarePlusTheme {
                AppNavigation()
            }
        }
    }
}
