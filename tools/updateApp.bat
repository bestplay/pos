@echo off
taskkill /f /im %1 
ping -n 3 127.0.0.1 >nul
taskkill /f /im %1 
ping -n 2 127.0.0.1 >nul
xcopy %3 %4 /Y /K /H /E 
:: start %2
exit 0
