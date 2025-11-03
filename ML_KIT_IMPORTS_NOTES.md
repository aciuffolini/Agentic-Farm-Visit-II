# ML Kit GenAI - Notas sobre Imports

## ⚠️ Importante

Los imports de ML Kit GenAI Prompt API pueden variar según la versión exacta. El código actual usa:

```java
import com.google.mlkit.genai.prompt.Generation;
import com.google.mlkit.genai.prompt.FeatureStatus;
```

## Si hay errores de compilación, probar estas alternativas:

### Alternativa 1 (si `genai.prompt` no existe):
```java
import com.google.mlkit.genai.GenerativeModel;
import com.google.mlkit.genai.FeatureStatus;
```

### Alternativa 2 (si usa estructura diferente):
```java
import com.google.mlkit.genai.prompt.GenerativeModel;
import com.google.mlkit.genai.prompt.ModelStatus;
```

## Cómo verificar la estructura correcta:

1. **Después de `gradle build`**, si hay error de imports:
   - El error mostrará qué clase no encuentra
   - Ajustar según el error específico

2. **Verificar en la documentación oficial**:
   - https://developers.google.com/ml-kit/genai
   - Revisar ejemplos de código Kotlin/Java

3. **Inspeccionar el JAR**:
   - El JAR descargado por Gradle está en:
   - `.gradle\caches\modules-2\files-2.1\com.google.mlkit\genai-prompt\`
   - Puedes extraerlo y ver la estructura de paquetes

## Dependencia en build.gradle:

```gradle
implementation 'com.google.mlkit:genai-prompt:1.0.0-alpha01'
```

Si esta versión no existe o causa problemas:
- Probar: `1.0.0-alpha1` (sin cero)
- O buscar la versión más reciente en: https://mvnrepository.com/artifact/com.google.mlkit/genai-prompt

## Métodos que usamos:

1. `Generation.getClient()` - Obtener instancia
2. `model.checkStatus()` - Verificar disponibilidad
3. `model.download()` - Descargar modelo
4. `model.generateContent(prompt)` - Generar texto

Si estos métodos no existen, revisar la API real en la documentación.


