# Tiny static file server for local preview — no installs needed.
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Then open http://localhost:8080 in your browser. Ctrl+C to stop.

param([int]$Port = 8080)

$root = $PSScriptRoot
$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json'
  '.xml'  = 'application/xml'
  '.txt'  = 'text/plain; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.pdf'  = 'application/pdf'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $path = [uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($path.EndsWith('/')) { $path += 'index.html' }
      $file = Join-Path $root ($path -replace '/', '\')

      $ok = (Test-Path $file -PathType Leaf) -and ((Resolve-Path $file).Path).StartsWith($root)
      if (-not $ok) {
        $file = Join-Path $root '404.html'
        $ctx.Response.StatusCode = 404
      }

      $ext = [IO.Path]::GetExtension($file).ToLower()
      $ctx.Response.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
      $ctx.Response.Headers['Cache-Control'] = 'no-store'
      $bytes = [IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentLength64 = $bytes.Length
      if ($ctx.Request.HttpMethod -ne 'HEAD') {
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    } catch {
      try { $ctx.Response.StatusCode = 500 } catch {}
      Write-Host "Error serving $($ctx.Request.Url.AbsolutePath): $($_.Exception.Message)"
    } finally {
      try { $ctx.Response.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
