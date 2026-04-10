package edu.cit.monreal.petcareplus.datastore

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "petcareplus_prefs")

object TokenDataStore {
    private val KEY_TOKEN = stringPreferencesKey("access_token")
    private val KEY_ROLE = stringPreferencesKey("role")
    private val KEY_EMAIL = stringPreferencesKey("email")

    suspend fun saveToken(context: Context, token: String) {
        context.dataStore.edit { it[KEY_TOKEN] = token }
    }

    suspend fun getToken(context: Context): String? {
        return context.dataStore.data.map { it[KEY_TOKEN] }.first()
    }

    suspend fun saveRole(context: Context, role: String) {
        context.dataStore.edit { it[KEY_ROLE] = role }
    }

    suspend fun getRole(context: Context): String? {
        return context.dataStore.data.map { it[KEY_ROLE] }.first()
    }

    suspend fun saveUserEmail(context: Context, email: String) {
        context.dataStore.edit { it[KEY_EMAIL] = email }
    }

    suspend fun getUserEmail(context: Context): String? {
        return context.dataStore.data.map { it[KEY_EMAIL] }.first()
    }

    // Option 1: Clear specific keys
    suspend fun clearAll(context: Context) {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_TOKEN)
            prefs.remove(KEY_ROLE)
            prefs.remove(KEY_EMAIL)
        }
    }

    // Option 2: Wipe everything in this DataStore (Shorter/Cleaner)
    suspend fun clearEverything(context: Context) {
        context.dataStore.edit { it.clear() }
    }
}