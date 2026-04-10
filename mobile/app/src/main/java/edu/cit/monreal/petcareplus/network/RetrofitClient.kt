// This file builds a Retrofit client with logging and attaches the auth token if available
package edu.cit.monreal.petcareplus.network

import android.content.Context
import edu.cit.monreal.petcareplus.datastore.TokenDataStore
import edu.cit.monreal.petcareplus.utils.Constants
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    private fun authInterceptor(context: Context) = Interceptor { chain ->
        val original = chain.request()
        val token = runBlocking { TokenDataStore.getToken(context) }
        val req = if (!token.isNullOrBlank()) {
            original.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else original
        chain.proceed(req)
    }

    fun api(context: Context): ApiService {
        val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }
        val okHttp = OkHttpClient.Builder()
            .addInterceptor(logging)
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
