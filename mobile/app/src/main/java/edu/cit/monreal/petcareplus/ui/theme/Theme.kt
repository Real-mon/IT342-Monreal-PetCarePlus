// This file configures the Material3 theme for the app
package edu.cit.monreal.petcareplus.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = PetCareTeal,
    onPrimary = BackgroundWhite,
    background = BackgroundWhite
)

private val DarkColors = darkColorScheme(
    primary = PetCareTealDark
)

@Composable
fun PetCarePlusTheme(
    darkTheme: Boolean = false,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = PetCareTypography,
        content = content
    )
}
