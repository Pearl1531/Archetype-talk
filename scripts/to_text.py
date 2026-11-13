#!/usr/bin/env python3
"""to_text.py — turn a PDF, Word file, scan or photo into Markdown text the graph can read.

  python3 scripts/to_text.py Inbox/report.pdf            # writes Inbox/report.md
  python3 scripts/to_text.py Inbox/notes.docx -o out.md
  python3 scripts/to_text.py selftest

Everything runs on this machine — nothing is sent anywhere. Pages keep a `[p. N]` marker so a
quote or a figure can be traced back to the original. Exit code 2 means some pages could not
be read (no text layer, and OCR was unavailable or found nothing): those pages are marked in
the output and have to be read from the original (CLAUDE.md rule 7: a number is only as good
as its document). A page whose two OCR passes read different numbers opens with an
`*(OCR check: …)*` line.

PDF text layer: pypdf if installed, else `pdftotext`; with neither, every page goes to OCR.
OCR: macOS Vision (built in, both recognition levels), else `tesseract` for images.
"""
import os, re, shutil, subprocess, sys, tempfile, zipfile
from xml.etree import ElementTree

IMAGES = {".png", ".jpg", ".jpeg", ".heic", ".tif", ".tiff", ".bmp", ".gif", ".webp"}
PLAIN = {".txt", ".srt", ".vtt", ".md"}
SPARSE = 40  # fewer characters than this on a PDF page = no usable text layer, so OCR it
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

# Renders each PDF page (or opens the image) and prints what Vision reads; "\f<page>" starts a page.
# ponytail: Vision's own reading order, top to bottom — a multi-column page can interleave; add
# column detection if two-column reports turn out to matter.
VISION = r"""
import Foundation
import Vision
import PDFKit
import AppKit
// A white canvas at >= 2000 px wide: a transparent scan reads as black-on-black to Vision,
// and small text needs pixels. `draw` paints the page or image into it.
func canvas(_ size: NSSize, _ draw: (CGContext, CGFloat) -> Void) -> CGImage? {
    let scale = max(1.0, 2000.0 / max(size.width, 1))
    let w = Int(size.width * scale), h = Int(size.height * scale)
    guard w > 0, h > 0, let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { return nil }
    ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
    ctx.interpolationQuality = .high
    draw(ctx, scale)
    return ctx.makeImage()
}
// Both levels, keep the one that read more: on some macOS builds `.accurate` returns nothing
// (or merges lines and drops words) where `.fast` reads the page cleanly. The first line of
// the result names the level used, so the header can say it.
func read(_ cg: CGImage, _ level: VNRequestTextRecognitionLevel) -> String {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = level
    request.usesLanguageCorrection = level == .accurate
    if #available(macOS 13.0, *) { request.automaticallyDetectsLanguage = true }
    try? VNImageRequestHandler(cgImage: cg, options: [:]).perform([request])
    return (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
}
// When the two levels read different numbers, the level line ends in "!": the page's figures
// can't be trusted without checking the original.
func numbers(_ s: String) -> Set<String> {
    let rx = try! NSRegularExpression(pattern: "[0-9][0-9.,]*")
    return Set(rx.matches(in: s, range: NSRange(s.startIndex..., in: s)).map { (s as NSString).substring(with: $0.range) })
}
func ocr(_ image: CGImage?) -> String {
    guard let cg = image else { return "accurate\n" }
    let accurate = read(cg, .accurate), fast = read(cg, .fast)
    let flag = !accurate.isEmpty && !fast.isEmpty && numbers(accurate) != numbers(fast) ? "!" : ""
    return fast.count > accurate.count ? "fast\(flag)\n" + fast : "accurate\(flag)\n" + accurate
}
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let only = Set(CommandLine.arguments.dropFirst(2).compactMap { Int($0) })
if url.pathExtension.lowercased() == "pdf", let doc = PDFDocument(url: url) {
    for i in 0..<doc.pageCount where only.isEmpty || only.contains(i + 1) {
        guard let page = doc.page(at: i) else { continue }
        let box = page.bounds(for: .mediaBox)
        let image = canvas(box.size) { ctx, scale in   // vector page drawn at full resolution, never upscaled
            ctx.scaleBy(x: scale, y: scale)
            ctx.translateBy(x: -box.origin.x, y: -box.origin.y)
            page.draw(with: .mediaBox, to: ctx)
        }
        print("\u{0C}\(i + 1)")
        print(ocr(image))
    }
} else if let image = NSImage(contentsOf: url) {
    let cg = canvas(image.size) { ctx, scale in
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = NSGraphicsContext(cgContext: ctx, flipped: false)
        image.draw(in: NSRect(x: 0, y: 0, width: image.size.width * scale, height: image.size.height * scale))
        NSGraphicsContext.restoreGraphicsState()
    }
    print("\u{0C}1")
    print(ocr(cg))
}
"""


def docx_text(path):
    """Paragraphs and table cells of a .docx, in document order. Stdlib only."""
    body = ElementTree.fromstring(zipfile.ZipFile(path).read("word/document.xml")).find(W + "body")
    out = []
    for block in body:
        if block.tag == W + "p":
            out.append("".join(t.text or "" for t in block.iter(W + "t")))
        elif block.tag == W + "tbl":
            for row in block.iter(W + "tr"):
                out.append(" | ".join("".join(t.text or "" for t in cell.iter(W + "t")) for cell in row.iter(W + "tc")))
    return "\n\n".join(line for line in out if line.strip())


def pdf_pages(path):
    """[text per page] from the PDF's text layer, or None when no extractor is installed."""
    try:
        from pypdf import PdfReader
        return [(page.extract_text() or "").strip() for page in PdfReader(path).pages]
    except ImportError:
        pass
    if shutil.which("pdftotext"):
        out = subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True, text=True).stdout
        return [p.strip() for p in out.split("\f")][:-1] or [out.strip()]
    return None


def ocr(path, pages=()):
    """({page: text}, engine) read locally from a scan or photo; ({}, None) when no OCR engine exists."""
    if sys.platform == "darwin" and shutil.which("swift"):
        with tempfile.TemporaryDirectory() as d:
            src = os.path.join(d, "ocr.swift")
            open(src, "w").write(VISION)
            run = subprocess.run(["swift", src, path] + [str(p) for p in pages], capture_output=True, text=True)
        if run.returncode == 0 and "\f" in run.stdout:
            found, levels = {}, set()
            for chunk in run.stdout.split("\f")[1:]:
                number, _, rest = chunk.partition("\n")
                level, _, text = rest.partition("\n")
                text = text.strip()
                if level.endswith("!") and text:
                    text = ("*(OCR check: the two recognition passes read different numbers on this page — "
                            "verify every figure against the original before citing it)*\n\n" + text)
                found[int(number)] = text
                if text:
                    levels.add(level.rstrip("!"))
            return found, "ocr-vision-" + "+".join(sorted(levels) or ["accurate"])
    if shutil.which("tesseract") and os.path.splitext(path)[1].lower() in IMAGES:
        run = subprocess.run(["tesseract", path, "-"], capture_output=True, text=True)
        if run.returncode == 0:
            return {1: run.stdout.strip()}, "ocr-tesseract"
    return {}, None


def convert(path):
    """(markdown, pages that could not be read)"""
    ext, name = os.path.splitext(path)[1].lower(), os.path.basename(path)
    unread, how = [], {}
    if ext == ".pdf":
        pages = pdf_pages(path) or []
        sparse = [i + 1 for i, text in enumerate(pages) if len(text) < SPARSE] if pages else []
        scanned, engine = ocr(path, sparse) if (sparse or not pages) else ({}, None)
        total = max(len(pages), max(scanned, default=0))
        parts = []
        for n in range(1, total + 1):
            text = pages[n - 1] if n <= len(pages) and len(pages[n - 1]) >= SPARSE else ""
            kind = "text-layer"
            if not text:
                text, kind = scanned.get(n, ""), engine
            if not text:
                unread.append(n)
                why = "OCR found no text on it" if engine else "no text layer and no local OCR"
                text, kind = f"*(page not read: {why} — read it from the original)*", "unread"
            how[kind] = how.get(kind, 0) + 1
            parts.append(f"[p. {n}]\n\n{text}")
        body = "\n\n".join(parts) or "*(empty PDF)*"
    elif ext in IMAGES:
        scanned, engine = ocr(path)
        body, how = scanned.get(1, ""), {engine or "unread": 1}
        if not body:
            why = "OCR found no text in it" if engine else "no local OCR available"
            unread, body, how = [1], f"*(image not read: {why} — read the image itself)*", {"unread": 1}
    elif ext == ".docx":
        body, how = docx_text(path), {"docx": 1}
    elif ext in (".doc", ".rtf", ".odt") and shutil.which("textutil"):
        body = subprocess.run(["textutil", "-convert", "txt", "-stdout", path], capture_output=True, text=True).stdout.strip()
        how = {"textutil": 1}
    elif ext in PLAIN:
        body, how = open(path, encoding="utf-8", errors="replace").read().strip(), {"plain": 1}
    else:
        sys.exit(f"to_text: don't know how to read {ext or 'this file'} — supported: .pdf .docx .doc .rtf .odt .txt .srt .vtt and images")
    summary = ", ".join(f"{k} ×{v}" for k, v in how.items())
    return f"<!-- converted from \"{name}\" by scripts/to_text.py · extraction: {summary} -->\n\n{body}\n", unread


def selftest():
    with tempfile.TemporaryDirectory() as d:
        doc = os.path.join(d, "t.docx")
        xml = (f'<w:document xmlns:w="{W[1:-1]}"><w:body><w:p><w:r><w:t>First </w:t></w:r><w:r><w:t>line.</w:t></w:r></w:p>'
               '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>a</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>31%</w:t></w:r></w:p></w:tc></w:tr></w:tbl>'
               '</w:body></w:document>')
        with zipfile.ZipFile(doc, "w") as z:
            z.writestr("word/document.xml", xml)
        text, unread = convert(doc)
        assert "First line." in text and "a | 31%" in text and not unread, text
        plain = os.path.join(d, "t.txt")
        open(plain, "w").write("hello")
        assert "hello" in convert(plain)[0]
    print("selftest ok")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    if args[0] == "selftest":
        selftest()
        sys.exit(0)
    src = args[0]
    out = args[args.index("-o") + 1] if "-o" in args else os.path.splitext(src)[0] + ".md"
    if os.path.abspath(out) == os.path.abspath(src):
        sys.exit("to_text: the output would overwrite the source — pass -o")
    text, unread = convert(src)
    open(out, "w", encoding="utf-8").write(text)
    words = len(re.sub(r"<!--.*?-->", "", text, flags=re.S).split())
    print(f"{out}: {words} words" + (f" — UNREAD pages: {unread}" if unread else ""))
    sys.exit(2 if unread else 0)
