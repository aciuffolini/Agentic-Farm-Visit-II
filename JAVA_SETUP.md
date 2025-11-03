# Java JDK Setup para Android Development

## Requisito
Android requiere **JDK 17** (Java Development Kit 17) para compilar.

## Pasos de Instalación en Windows

### Opción 1: Oracle JDK 17 (Recomendado)

1. **Descargar JDK 17:**
   - Ve a: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - Descarga: **Windows x64 Installer** (`.msi`)
   - Ejemplo: `jdk-17.0.x_windows-x64_bin.msi`

2. **Instalar:**
   - Ejecuta el `.msi`
   - Sigue el asistente (acepta defaults)
   - Se instalará en: `C:\Program Files\Java\jdk-17`

3. **Configurar Variables de Entorno:**
   
   **Opción A - Automático (si el instalador lo ofrece):**
   - Durante instalación, marca "Set JAVA_HOME variable"
   
   **Opción B - Manual:**
   - Presiona `Win + R`, escribe `sysdm.cpl`, Enter
   - Pestaña "Advanced" → "Environment Variables"
   - En "System variables", click "New":
     - Variable name: `JAVA_HOME`
     - Variable value: `C:\Program Files\Java\jdk-17` (o donde se instaló)
   - Edita "Path" → Agrega: `%JAVA_HOME%\bin`
   - Click OK en todo

4. **Verificar Instalación:**
   - Abre **nueva** terminal (PowerShell o CMD)
   - Ejecuta:
     ```powershell
     java -version
     javac -version
     ```
   - Debe mostrar algo como: `java version "17.0.x"`

### Opción 2: OpenJDK 17 (Alternativa Gratuita)

1. **Descargar Adoptium (Eclipse Temurin):**
   - Ve a: https://adoptium.net/temurin/releases/?version=17
   - Descarga: **JDK 17** → **Windows x64** → **.msi Installer**

2. **Instalar y Configurar:**
   - Mismo proceso que Opción 1
   - Se instalará en: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`

## Configurar en VS Code (si usas VS Code)

1. **Instalar extensión:**
   - Extensión: "Extension Pack for Java" (Microsoft)

2. **Configurar JDK:**
   - Abre Command Palette (`Ctrl+Shift+P`)
   - Busca: `Java: Configure Java Runtime`
   - Selecciona el JDK 17 instalado

## Verificar que Funciona

Abre PowerShell **nuevo** y ejecuta:

```powershell
# Verificar Java
java -version

# Verificar compilador
javac -version

# Verificar JAVA_HOME
echo $env:JAVA_HOME
```

**Salida esperada:**
```
java version "17.0.x" 2023-xx-xx LTS
Java(TM) SE Runtime Environment (build 17.0.x+xx-LTS-xxx)
Java HotSpot(TM) 64-Bit Server VM (build 17.0.x+xx-LTS-xxx, mixed mode, sharing)
```

## Si ya tienes Java instalado

Verifica la versión:
```powershell
java -version
```

Si es **Java 8, 11, o 19+**, necesitas **JDK 17 específicamente** porque:
- Android Gradle Plugin requiere JDK 17
- Capacitor Android requiere JDK 17

Puedes tener múltiples versiones instaladas y configurar JAVA_HOME según el proyecto.

## Troubleshooting

### "java is not recognized"
- **Causa**: No está en PATH
- **Solución**: Agrega `%JAVA_HOME%\bin` a PATH en variables de entorno

### "UnsupportedClassVersionError"
- **Causa**: Estás usando Java 8/11 en lugar de 17
- **Solución**: Instala JDK 17 y actualiza JAVA_HOME

### "JAVA_HOME not set"
- **Solución**: Configura JAVA_HOME como se explicó arriba

## Después de Instalar

Una vez instalado, puedes:
1. Compilar el proyecto Android
2. Verificar que los imports de ML Kit funcionan
3. Generar el APK

---

**Nota**: Después de instalar JDK 17, **cierra y abre nuevamente** todas las terminales/IDEs para que tomen los cambios.


