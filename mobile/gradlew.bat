@rem This file is the Gradle Wrapper script for Windows
@echo off
setlocal
set DIR=%~dp0

if not defined JAVA_HOME (
  set JAVA_EXE=java
) else (
  set JAVA_EXE=%JAVA_HOME%\bin\java
)

"%JAVA_EXE%" -classpath "%DIR%\gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain %*
exit /b %ERRORLEVEL%
