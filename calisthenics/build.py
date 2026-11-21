# Assembles index.html (single self-contained page) from the source files.
import pathlib
d = pathlib.Path(__file__).parent
s = (d/'shell.html').read_text()
for tag, f in [('ENGINE','demo-engine.js'),('DEMOS','demos.js'),('PLAN','plan-data.js'),('APP','app.js')]:
    js = (d/f).read_text()
    assert '</script' not in js, f
    s = s.replace('<script>/*%s*/</script>' % tag, '<script>\n' + js + '\n</script>')
(d/'index.html').write_text(s)
print('built', len(s))
