#!/usr/bin/env python3
"""목회 일지 — 구글 캘린더 → journal/calendar.json 동기화

사용:
  python3 tools/sync-calendar.py [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--dry]

동작:
  gog(구글 워크스페이스 연결)로 주 캘린더 일정을 읽어 앱이 그대로 fetch 하는
  journal/calendar.json 을 다시 쓴다. 비밀 iCal 주소는 쓰지 않는다(공개 저장소).
  바뀐 내용이 있으면 exit 0 + {"changed": true}, 그대로면 {"changed": false}.
"""
import argparse, datetime as dt, json, os, subprocess, sys, tempfile

WD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # .../journal
OUT = os.path.join(WD, 'calendar.json')


def run_gog(frm, to):
    cmd = ['gog', '--readonly', 'calendar', 'events', 'primary',
           '--from', frm + 'T00:00:00+09:00', '--to', to + 'T00:00:00+09:00',
           '--all-pages', '--max', '2500', '--results-only',
           '--select', 'id,summary,start,end,location,description,status']
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if p.returncode != 0:
        raise SystemExit('gog failed: ' + (p.stderr or p.stdout)[:400])
    env = json.loads(p.stdout)
    if not env.get('ok'):
        raise SystemExit('gog not ok: ' + json.dumps(env.get('message'))[:300])
    result = env.get('data', {}).get('result')
    if isinstance(result, list):
        return result
    # 결과가 커서 파일로 넘어간 경우
    saved = (env.get('data') or {}).get('saved_to')
    if saved:
        path = saved if os.path.isabs(saved) else os.path.join('/workspace', saved)
        doc = json.load(open(path))
        r = doc.get('data', {}).get('result')
        if isinstance(r, list):
            return r
        if isinstance(r, dict) and isinstance(r.get('items'), list):
            return r['items']
    if isinstance(result, dict) and isinstance(result.get('items'), list):
        return result['items']
    return []


def norm(ev):
    st = ev.get('start') or {}
    en = ev.get('end') or {}
    allday = 'date' in st
    start = st.get('date') or (st.get('dateTime') or '')[:19]
    end = en.get('date') or (en.get('dateTime') or '')[:19]
    desc = (ev.get('description') or '').strip()
    if len(desc) > 400:
        desc = desc[:400].rstrip() + '…'
    return {
        'uid': ev.get('id', ''),
        'start': start,
        'end': end,
        'summary': (ev.get('summary') or '').strip(),
        'location': (ev.get('location') or '').strip(),
        'desc': desc,
        'allDay': allday,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--from')
    ap.add_argument('--to')
    ap.add_argument('--dry', action='store_true')
    a = ap.parse_args()
    today = dt.date.today()
    frm = a.__dict__['from'] or (today - dt.timedelta(days=45)).isoformat()
    to = a.to or (today + dt.timedelta(days=270)).isoformat()

    raw = run_gog(frm, to)
    events, seen = [], set()
    for ev in raw:
        if (ev.get('status') or 'confirmed') == 'cancelled':
            continue
        e = norm(ev)
        if not e['summary'] or not e['start']:
            continue
        key = (e['start'], e['summary'])
        if key in seen:
            continue
        seen.add(key)
        events.append(e)
    events.sort(key=lambda e: (e['start'], e['summary']))

    doc = {
        'app': '박재용 목사 목회 일지',
        'source': 'google-calendar',
        'calendar': 'pjy53283683@gmail.com',
        'generated': dt.datetime.now().astimezone().replace(microsecond=0).isoformat(),
        'range': {'from': frm, 'to': to},
        'count': len(events),
        'events': events,
    }
    text = json.dumps(doc, ensure_ascii=False, indent=0)
    old = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
    # generated 시각만 다른 경우는 '바뀌지 않은 것'으로 본다
    def body(t):
        try:
            d = json.loads(t)
            d.pop('generated', None)
            return json.dumps(d, ensure_ascii=False, sort_keys=True)
        except Exception:
            return t
    changed = body(text) != body(old)
    if changed and not a.dry:
        with open(OUT, 'w', encoding='utf-8') as f:
            f.write(text + '\n')
    print(json.dumps({'changed': changed, 'count': len(events),
                      'range': doc['range'], 'generated': doc['generated']},
                     ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
