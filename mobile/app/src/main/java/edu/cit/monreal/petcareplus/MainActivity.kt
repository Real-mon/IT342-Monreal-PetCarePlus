// This file is the app entry point; it sets the theme and launches the NavHost
package edu.cit.monreal.petcareplus

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import edu.cit.monreal.petcareplus.navigation.AppNavigation
import edu.cit.monreal.petcareplus.ui.theme.PetCarePlusTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            PetCarePlusTheme {
                AppNavigation()
            }
        }
    }
}
