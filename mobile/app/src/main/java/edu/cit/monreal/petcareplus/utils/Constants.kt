// This file exposes app-wide constants and returns the runtime base URL from BuildConfig
package edu.cit.monreal.petcareplus.utils

import edu.cit.monreal.petcareplus.BuildConfig

object Constants {
    // Returns the backend base URL; set via BuildConfigField to avoid hardcoding in code
    fun baseUrl(): String = BuildConfig.BASE_URL
}
