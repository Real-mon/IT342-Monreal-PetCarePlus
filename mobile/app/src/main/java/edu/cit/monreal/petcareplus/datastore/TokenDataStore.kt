// This file provides helper functions for saving and retrieving auth data via DataStore Preferences
package edu.cit.monreal.petcareplus.datastore

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "petcareplus_prefs")

object TokenDataStore {
    private val KEY_TOKEN = stringPreferencesKey("access_token")
    private val KEY_ROLE = stringPreferencesKey("user_role")
    private val KEY_EMAIL = stringPreferencesKey("user_email")

    suspend fun saveToken(context: Context, token: String) {
        context.dataStore.edit { prefs -> prefs[KEY_TOKEN] = token }
    }

    suspend fun getToken(context: Context): String? {
        return context.dataStore.data.map { it[KEY_TOKEN] }.first()
    }

    suspend fun saveRole(context: Context, role: String) {
        context.dataStore.edit { prefs -> prefs[KEY_ROLE] = role }
    }

    suspend fun getRole(context: Context): String? {
        return context.dataStore.data.map { it[KEY_ROLE] }.first()
    }

    suspend fun saveUserEmail(context: Context, email: String) {
        context.dataStore.edit { prefs -> prefs[KEY_EMAIL] = email }
    }

    suspend fun getUserEmail(context: Context): String? {
        return context.dataStore.data.map { it[KEY_EMAIL] }.first()
    }

    suspend fun clearAll(context: Context) {
        context.dataStore.edit { prefs: Preferences ->
            prefs.remove(KEY_TOKEN)
            prefs.remove(KEY_ROLE)
            prefs.remove(KEY_EMAIL)
        }
    }
}
