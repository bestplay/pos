@echo off
:: �����Զ��������
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Connections" /v DefaultConnectionSettings /t REG_BINARY /d 4600000000 /f >nul 2>nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Connections" /v SavedLegacySettings /t REG_BINARY /d 4600000000 /f >nul 2>nul
:: �����Զ����ƽű�����ַҲ��ɾ����
:: reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v AutoConfigURL /f >nul 2>nul
::pause