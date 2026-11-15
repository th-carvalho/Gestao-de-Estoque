Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
Dim scriptDir
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
shell.Run "cmd /c """ & scriptDir & "\Iniciar Sistema.bat""", 1, False
