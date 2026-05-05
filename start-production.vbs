Set WshShell = CreateObject("WScript.Shell")
' Chạy lệnh npm run start ở chế độ ẩn (0) và không đợi kết thúc (false)
WshShell.Run "cmd /c npm run start", 0, false
