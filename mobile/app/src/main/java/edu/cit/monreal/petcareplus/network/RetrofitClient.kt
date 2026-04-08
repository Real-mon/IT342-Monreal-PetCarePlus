// This file provides a singleton Retrofit client with logging and auth interceptors
package edu.cit.monreal.petcareplus.network

import android.content.Context
import edu.cit.monreal.petcareplus.utils.Constants
import edu.cit.monreal.petcareplus.datastore.TokenDataStore
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Logging interceptor for debugging HTTP requests/responses
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    // Auth interceptor that attaches Bearer token from DataStore
    private fun authInterceptor(context: Context) = Interceptor { chain ->
        val original = chain.request()
        val token = runBlocking { TokenDataStore.getToken(context) }
        val newReq = if (!token.isNullOrBlank()) {
            original.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else original
        chain.proceed(newReq)
    }

    fun create(context: Context): ApiService {
        val okHttp = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor(authInterceptor(context))
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(Constants.baseUrl())
            .addConverterFactory(GsonConverterFactory.create())
            .client(okHttp)
            .build()

        return retrofit.create(ApiService::class.java)
    }
}
