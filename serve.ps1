# Tiny static file server for local preview with live reload — no installs needed.
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Then open http://localhost:8080 in your browser. Ctrl+C to stop.
# Saving a CSS file swaps the stylesheet in place; saving anything else reloads the page.

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

# Served from the same origin so the site's CSP (script-src 'self') allows it. The HTML
# rewrite below widens connect-src to 'self' for the polling fetch — dev only, never shipped.
$reloadScript = @'
(function () {
  var last = null;
  function swapCss() {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(function (old) {
      var u = new URL(old.href);
      if (u.origin !== location.origin) return;
      u.searchParams.set('__t', Date.now());
      var fresh = old.cloneNode();
      fresh.href = u.href;
      fresh.onload = function () { old.remove(); };
      old.parentNode.insertBefore(fresh, old.nextSibling);
    });
  }
  setInterval(function () {
    fetch('/__version', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (v) {
        if (last === null) { last = v; return; }
        if (v.page !== last.page) { location.reload(); return; }
        if (v.css !== last.css) swapCss();
        last = v;
      })
      .catch(function () {});
  }, 400);
})();
'@

function Get-Version {
  $page = 0L; $css = 0L
  $stack = New-Object System.Collections.Stack
  $stack.Push($root)
  while ($stack.Count) {
    $dir = $stack.Pop()
    foreach ($d in [IO.Directory]::EnumerateDirectories($dir)) {
      $n = [IO.Path]::GetFileName($d)
      if ($n -ne '.git' -and $n -ne 'node_modules') { $stack.Push($d) }
    }
    foreach ($f in [IO.Directory]::EnumerateFiles($dir)) {
      $t = [IO.File]::GetLastWriteTimeUtc($f).Ticks
      if ([IO.Path]::GetExtension($f) -eq '.css') { if ($t -gt $css) { $css = $t } }
      else { if ($t -gt $page) { $page = $t } }
    }
  }
  return "{`"page`":$page,`"css`":$css}"
}

$utf8 = New-Object System.Text.UTF8Encoding $false
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port with live reload  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    try {
      $path = [uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      $ctx.Response.Headers['Cache-Control'] = 'no-store'

      if ($path -eq '/__version') {
        $bytes = $utf8.GetBytes((Get-Version))
        $ctx.Response.ContentType = 'application/json'
      }
      elseif ($path -eq '/__reload.js') {
        $bytes = $utf8.GetBytes($reloadScript)
        $ctx.Response.ContentType = $mime['.js']
      }
      else {
        if ($path.EndsWith('/')) { $path += 'index.html' }
        $file = Join-Path $root ($path -replace '/', '\')

        $ok = (Test-Path $file -PathType Leaf) -and ((Resolve-Path $file).Path).StartsWith($root)
        if (-not $ok) {
          $file = Join-Path $root '404.html'
          $ctx.Response.StatusCode = 404
        }

        $ext = [IO.Path]::GetExtension($file).ToLower()
        $ctx.Response.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }

        if ($ext -eq '.html') {
          $html = [IO.File]::ReadAllText($file)
          $html = $html.Replace("connect-src 'none'", "connect-src 'self'")
          $html = $html.Replace('</body>', '<script src="/__reload.js"></script>' + "`n</body>")
          $bytes = $utf8.GetBytes($html)
        } else {
          $bytes = [IO.File]::ReadAllBytes($file)
        }
      }

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
