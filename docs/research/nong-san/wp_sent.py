import json,sys,urllib.request,urllib.error,urllib.parse,time,re
UA={'User-Agent':'em-kham-pha-lsdl/1.0 (educational)'}
def extract(t):
    u='https://vi.wikipedia.org/w/api.php?'+urllib.parse.urlencode({'action':'query','prop':'extracts','explaintext':1,'titles':t,'redirects':1,'format':'json','formatversion':2})
    for a in range(6):
        try:
            p=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30))['query']['pages'][0]; break
        except urllib.error.HTTPError as e:
            if e.code!=429: raise
            time.sleep(10*(a+1))
    return p.get('title'),p.get('extract','')
C=json.load(open(sys.argv[1]))
cache={}
for pid,arts in C.items():
    for art,kws in arts.items():
        if art not in cache: cache[art]=extract(art); time.sleep(2)
        title,txt=cache[art]
        sents=re.split(r'(?<=[.!?])\s+|\n',txt)
        for k in kws:
            hit=[s.strip() for s in sents if k.lower() in s.lower()]
            print(f'{pid} | {title} | {k} | {len(hit)} | {(hit[0][:220] if hit else "-")}')
