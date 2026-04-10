// This file provides access to the backend Base URL via BuildConfig (no URL hardcoded in code)
package edu.cit.monreal.petcareplus.utils

import edu.cit.monreal.petcareplus.BuildConfig

object Constants {
    fun baseUrl(): String = BuildConfig.BASE_URL
}
