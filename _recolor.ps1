$files = Get-ChildItem 'c:\Users\DELL\OneDrive\Desktop\majors\onedoc\app' -Recurse -Include '*.tsx','*.ts'
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $content = $content.Replace('#7c6aff','#10b981')
    $content = $content.Replace('#a78bfa','#34d399')
    $content = $content.Replace('#5b4bcf','#059669')
    $content = $content.Replace('#00d4aa','#f59e0b')
    $content = $content.Replace('#00b894','#d97706')
    [System.IO.File]::WriteAllText($file.FullName, $content)
    Write-Host "Updated: $($file.Name)"
}
