package com.farmvisit.app;

import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// ML Kit GenAI Generative API imports (CORRECT PACKAGE STRUCTURE)
import com.google.mlkit.genai.generative.FeatureStatus;
import com.google.mlkit.genai.generative.Generation;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Capacitor Plugin for Gemini Nano on-device using ML Kit GenAI Generative API
 * Requires Android 14+ (API 34+) with AICore support
 * 
 * Uses correct package: com.google.mlkit.genai.generative.*
 * Dependency: com.google.mlkit:genai-prompt:1.0.0-alpha1
 */
@CapacitorPlugin(name = "GeminiNano")
public class GeminiNanoPlugin extends Plugin {

    private com.google.mlkit.genai.generative.Generation model;
    private boolean modelInitialized = false;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Executor backgroundExecutor = Executors.newSingleThreadExecutor();

    /**
     * Check if device supports Gemini Nano on-device
     */
    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        
        // Check Android version (API 34 = Android 14)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ret.put("available", false);
            ret.put("reason", "Android 14+ required");
            call.resolve(ret);
            return;
        }

        try {
            // Get ML Kit GenAI client (CORRECT API)
            android.util.Log.d("GeminiNano", "Attempting to get Generation client...");
            model = Generation.getClient();
            android.util.Log.d("GeminiNano", "Got Generation client, checking status...");
            
            FeatureStatus status = model.checkStatus();
            android.util.Log.d("GeminiNano", "Status: " + status.name());
            
            // Check status enum (UNAVAILABLE, DOWNLOADABLE, DOWNLOADING, AVAILABLE)
            boolean isAvailable = (status == FeatureStatus.AVAILABLE || 
                                  status == FeatureStatus.DOWNLOADABLE || 
                                  status == FeatureStatus.DOWNLOADING);
            
            ret.put("available", isAvailable);
            ret.put("status", status.name());
            
            if (status == FeatureStatus.DOWNLOADABLE) {
                ret.put("downloadable", true);
                android.util.Log.d("GeminiNano", "Model is downloadable");
            } else if (status == FeatureStatus.AVAILABLE) {
                android.util.Log.d("GeminiNano", "Model is already available");
            } else if (status == FeatureStatus.UNAVAILABLE) {
                android.util.Log.w("GeminiNano", "Model unavailable - device not supported");
                ret.put("reason", "Device not supported (no AICore / not eligible)");
            } else if (status == FeatureStatus.DOWNLOADING) {
                android.util.Log.d("GeminiNano", "Model is currently downloading");
            }
        } catch (NoClassDefFoundError e) {
            android.util.Log.e("GeminiNano", "Class not found error: " + e.getMessage());
            ret.put("available", false);
            ret.put("reason", "ML Kit GenAI classes not found. Check dependency: " + e.getMessage());
        } catch (Exception e) {
            android.util.Log.e("GeminiNano", "Error checking availability: " + e.getMessage(), e);
            ret.put("available", false);
            ret.put("reason", e.getClass().getSimpleName() + ": " + e.getMessage());
        }
        
        call.resolve(ret);
    }

    /**
     * Initialize and download model if needed
     */
    @PluginMethod
    public void initialize(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            call.reject("Android 14+ required for Gemini Nano");
            return;
        }

        try {
            android.util.Log.d("GeminiNano", "Initializing model...");
            model = Generation.getClient();
            FeatureStatus status = model.checkStatus();
            android.util.Log.d("GeminiNano", "Initialize status: " + status.name());
            
            // Handle all possible status values according to ML Kit API
            switch (status) {
                case UNAVAILABLE:
                    android.util.Log.w("GeminiNano", "Model unavailable - device not supported");
                    call.reject("Device not supported (no AICore / not eligible)");
                    return;
                    
                case DOWNLOADABLE:
                    android.util.Log.d("GeminiNano", "Starting model download...");
                    // Download model in background
                    model.download()
                        .addOnSuccessListener(aVoid -> {
                            android.util.Log.d("GeminiNano", "Model download successful");
                            modelInitialized = true;
                            JSObject ret = new JSObject();
                            ret.put("initialized", true);
                            ret.put("message", "Model downloaded successfully");
                            call.resolve(ret);
                        })
                        .addOnFailureListener(e -> {
                            android.util.Log.e("GeminiNano", "Model download failed: " + e.getMessage(), e);
                            call.reject("Failed to download model: " + e.getMessage());
                        });
                    return;
                    
                case DOWNLOADING:
                    android.util.Log.d("GeminiNano", "Model is currently downloading, waiting...");
                    // Model is already downloading, mark as initializing
                    JSObject ret = new JSObject();
                    ret.put("initialized", false);
                    ret.put("message", "Model is currently downloading, please wait");
                    call.resolve(ret);
                    return;
                    
                case AVAILABLE:
                    android.util.Log.d("GeminiNano", "Model already available, marking as initialized");
                    modelInitialized = true;
                    JSObject ret2 = new JSObject();
                    ret2.put("initialized", true);
                    ret2.put("message", "Model already available");
                    call.resolve(ret2);
                    return;
                    
                default:
                    android.util.Log.w("GeminiNano", "Unknown status: " + status);
                    call.reject("Model not available. Unknown status: " + status);
                    return;
            }
        } catch (NoClassDefFoundError e) {
            android.util.Log.e("GeminiNano", "Class not found during initialization: " + e.getMessage());
            call.reject("ML Kit GenAI not found. Check build.gradle dependency: " + e.getMessage());
        } catch (Exception e) {
            android.util.Log.e("GeminiNano", "Exception during initialization: " + e.getMessage(), e);
            call.reject("Failed to initialize: " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }

    /**
     * Generate text completion (non-streaming)
     */
    @PluginMethod
    public void generate(PluginCall call) {
        if (!modelInitialized || model == null) {
            call.reject("Model not initialized. Call initialize() first.");
            return;
        }

        String prompt = call.getString("prompt", "");
        if (prompt.isEmpty()) {
            call.reject("Prompt is required");
            return;
        }

        // Generate response using ML Kit GenAI Generative API
        android.util.Log.d("GeminiNano", "Generating content for prompt: " + prompt.substring(0, Math.min(50, prompt.length())));
        model.generateContent(prompt)
            .addOnSuccessListener(result -> {
                String responseText = result.getText();
                android.util.Log.d("GeminiNano", "Generation successful, response length: " + (responseText != null ? responseText.length() : 0));
                if (responseText == null || responseText.isEmpty()) {
                    android.util.Log.w("GeminiNano", "Empty response from model");
                    call.reject("Empty response from model");
                    return;
                }
                JSObject ret = new JSObject();
                ret.put("text", responseText);
                call.resolve(ret);
            })
            .addOnFailureListener(e -> {
                android.util.Log.e("GeminiNano", "Generation failed: " + e.getMessage(), e);
                call.reject("Generation failed: " + e.getMessage());
            });
    }

    /**
     * Stream text completion
     * Uses Handler for non-blocking async streaming simulation
     */
    @PluginMethod
    public void stream(PluginCall call) {
        if (!modelInitialized || model == null) {
            call.reject("Model not initialized. Call initialize() first.");
            return;
        }

        String prompt = call.getString("prompt", "");
        if (prompt.isEmpty()) {
            call.reject("Prompt is required");
            return;
        }

        // Store call reference for async resolution
        final PluginCall streamCall = call;

        // Generate response (streaming simulated using Handler for non-blocking)
        // Note: ML Kit may not support true streaming, so we simulate it
        model.generateContent(prompt)
            .addOnSuccessListener(result -> {
                // Process on background thread to avoid blocking
                backgroundExecutor.execute(() -> {
                    String responseText = result.getText();
                    
                    if (responseText == null || responseText.isEmpty()) {
                        mainHandler.post(() -> {
                            streamCall.reject("Empty response from model");
                        });
                        return;
                    }
                    
                    // Split into words for streaming effect
                    String[] words = responseText.split("\\s+");
                    
                    // Stream chunks word by word using Handler (non-blocking)
                    streamWordsAsync(words, 0, streamCall);
                });
            })
            .addOnFailureListener(e -> {
                call.reject("Streaming failed: " + e.getMessage());
            });
    }

    /**
     * Helper method to stream words asynchronously without blocking
     */
    private void streamWordsAsync(String[] words, int index, PluginCall call) {
        if (index >= words.length) {
            // All words sent, mark as done
            mainHandler.post(() -> {
                JSObject chunk = new JSObject();
                chunk.put("text", "");
                chunk.put("done", true);
                notifyListeners("streamChunk", chunk);
                call.resolve();
            });
            return;
        }

        // Send current word chunk
        mainHandler.post(() -> {
            JSObject chunk = new JSObject();
            chunk.put("text", words[index] + (index < words.length - 1 ? " " : ""));
            chunk.put("done", false);
            notifyListeners("streamChunk", chunk);
        });

        // Schedule next word after delay (30ms for smooth streaming)
        mainHandler.postDelayed(() -> {
            streamWordsAsync(words, index + 1, call);
        }, 30);
    }
}

