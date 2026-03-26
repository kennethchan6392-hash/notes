import sys

js = open('/Users/Kenneth/Desktop/notes/script.js').read()
opens = js.count('{')
closes = js.count('}')
print(f'JS braces: {opens} open, {closes} close, balance: {opens-closes}')
opens_p = js.count('(')
closes_p = js.count(')')
print(f'JS parens: {opens_p} open, {closes_p} close, balance: {opens_p-closes_p}')
opens_b = js.count('[')
closes_b = js.count(']')
print(f'JS brackets: {opens_b} open, {closes_b} close, balance: {opens_b-closes_b}')

css = open('/Users/Kenneth/Desktop/notes/style.css').read()
opens_c = css.count('{')
closes_c = css.count('}')
print(f'CSS braces: {opens_c} open, {closes_c} close, balance: {opens_c-closes_c}')

# Check HTML tag balance
html = open('/Users/Kenneth/Desktop/notes/index.html').read()
import re
tags = re.findall(r'<(/?)(\w+)', html)
stack = []
void_tags = {'meta','link','input','br','hr','img','option','canvas','source'}
for close, tag in tags:
    tag = tag.lower()
    if tag in void_tags:
        continue
    if not close:
        stack.append(tag)
    else:
        if stack and stack[-1] == tag:
            stack.pop()
        else:
            print(f'HTML mismatch: closing </{tag}> but expected </{stack[-1] if stack else "none"}>')
if stack:
    print(f'Unclosed HTML tags: {stack}')
else:
    print('HTML tags balanced')
