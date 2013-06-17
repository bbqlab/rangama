#!/usr/bin/env python
import re

f = open('/usr/share/dict/american-english')
parole = f.readlines()
for parola in parole:
  parola = parola.strip().lower()
  if len(parola)<4 or len(parola)>10: continue
  if re.match(r'^[a-z]*$',parola):
    print '"'  + parola + '",' ,
