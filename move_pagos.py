import re

with open('perfil_miembro.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract the block
match = re.search(r'(<!-- START: Moved Pagos Recientes.*?<!-- END: Moved Pagos -->\n?)', html, re.DOTALL)
if match:
    block = match.group(1)
    html = html.replace(block, '')
    
    # Insert inside view-pagos
    target = '<div class="hidden flex-col gap-6 sm:gap-8" id="view-pagos">\n'
    html = html.replace(target, target + '            ' + block)
    
    with open('perfil_miembro.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Block moved successfully')
else:
    print('Block not found')
