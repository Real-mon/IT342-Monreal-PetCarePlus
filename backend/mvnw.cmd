@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script, generated manually for this project.
@REM ----------------------------------------------------------------------------
@ECHO OFF
SETLOCAL

SET "MAVEN_PROJECTBASEDIR=%~dp0"
IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"

IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Maven Wrapper JAR not found: %WRAPPER_JAR%
  EXIT /B 1
)

IF DEFINED JAVA_HOME (
  SET "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) ELSE (
  SET "JAVA_EXE=java"
)

"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
EXIT /B %ERRORLEVEL%
