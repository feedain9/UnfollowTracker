"""Allowlisted, reproducible Chrome Web Store archive; no publishing side effects."""
import hashlib
import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'manifest.json').read_text())
files = [ROOT / 'manifest.json', ROOT / 'THIRD_PARTY_NOTICES.txt']
for directory in ['src', 'assets/icons', 'assets/fonts', '_locales']:
    files.extend(p for p in (ROOT / directory).rglob('*') if p.is_file() and p.name != '.DS_Store')
for p in files:
    if p.suffix in ['.js', '.html', '.css']:
        content = p.read_text()
        if 'fonts.googleapis.com' in content or '<script src="https://' in content:
            raise SystemExit(f'Remote dependency found: {p}')
destination = ROOT / 'dist' / f'unfollowtracker-{manifest["version"]}.zip'
destination.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED) as archive:
    for p in sorted(files):
        info = zipfile.ZipInfo(str(p.relative_to(ROOT)), (2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, p.read_bytes())
checksum = hashlib.sha256(destination.read_bytes()).hexdigest()
destination.with_suffix('.sha256').write_text(f'{checksum}  {destination.name}\n')
print(f'{destination.relative_to(ROOT)} — {len(files)} files, {destination.stat().st_size:,} bytes')
print(f'SHA-256: {checksum}')
