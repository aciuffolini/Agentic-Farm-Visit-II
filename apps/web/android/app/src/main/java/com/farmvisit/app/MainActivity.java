package com.farmvisit.app;

import android.os.Bundle;
import java.util.ArrayList;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.farmvisit.app.GeminiNanoPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register Gemini Nano plugin
        ArrayList<Class<? extends Plugin>> plugins = new ArrayList<>();
        plugins.add(GeminiNanoPlugin.class);
        this.init(savedInstanceState, plugins);
    }
}
