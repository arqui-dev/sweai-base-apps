#!/usr/bin/env bash
#
# Push .env.local to a Vercel project. There is no `vercel env push`, and
# `vercel env add` has no --force, so this upserts through the REST API.
#
#   ./scripts/env-push.sh                  # development + preview
#   ./scripts/env-push.sh --production     # all three environments
#   ./scripts/env-push.sh --file .env.prod --project other-project
#
# Auth: VERCEL_TOKEN, or the token the Vercel CLI already stored if you have
# run `vercel login`.
#
# Two values are never pushed, because pushing them is worse than leaving the
# variable empty:
#
#   - Anything matching the committed placeholder strings. Those are public, so
#     ADMIN_API_TOKEN=placeholder-admin-token-32-chars in production means
#     anyone who can read this repository can authenticate to /api/newsletter/send.
#     Empty is safe: unset secrets get random bytes at boot and fail closed.
#   - A localhost NEXT_PUBLIC_SITE_URL. Stripe redirects and magic-link
#     callbacks are built from it, and localhost is never right on Vercel.
#     Left empty it falls back to the deployment's own URL, which is correct
#     for a preview; production should carry the real domain.
set -euo pipefail

FILE=.env.local
PROJECT=sweai-base-apps
TARGETS='["development","preview"]'
WITH_PROD=0

while [ $# -gt 0 ]; do
  case "$1" in
    --production) TARGETS='["production","preview","development"]'; WITH_PROD=1; shift ;;
    --file) FILE="$2"; shift 2 ;;
    --project) PROJECT="$2"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

[ -f "$FILE" ] || { echo "no such file: $FILE" >&2; exit 1; }

TOKEN="${VERCEL_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  AUTH="$HOME/Library/Application Support/com.vercel.cli/auth.json"
  [ -f "$AUTH" ] || AUTH="$HOME/.local/share/com.vercel.cli/auth.json"
  if [ -f "$AUTH" ]; then
    TOKEN=$(sed -n 's/.*"token"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$AUTH")
  fi
fi
[ -n "$TOKEN" ] || { echo "No token. Set VERCEL_TOKEN or run: vercel login" >&2; exit 1; }

# Values that must stay unset rather than be filled with something public.
PLACEHOLDER='placeholder|replace_me|unconfigured|\bREPLACE\b'

# Everything else is plain. These are the ones worth encrypting at rest.
is_secret() {
  case "$1" in
    SUPABASE_SECRET_KEY|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|SANITY_API_READ_TOKEN|\
    RESEND_API_KEY|ADMIN_API_TOKEN|NEWSLETTER_SECRET) return 0 ;;
    *) return 1 ;;
  esac
}

json_escape() {
  printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null \
    || printf '"%s"' "$(printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g')"
}

echo "project : $PROJECT"
echo "file    : $FILE"
echo "targets : $TARGETS"
echo

pushed=0 skipped=0 failed=0
declare -a SKIPPED=()

while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|'#'*) continue ;; esac
  case "$line" in *=*) ;; *) continue ;; esac

  key=${line%%=*}
  value=${line#*=}
  key=$(printf '%s' "$key" | tr -d '[:space:]')
  # Strip one layer of matching quotes, keep inner spaces.
  case "$value" in
    \"*\") value=${value#\"}; value=${value%\"} ;;
    \'*\') value=${value#\'}; value=${value%\'} ;;
  esac

  if [ -n "$value" ] && printf '%s' "$value" | grep -qiE "$PLACEHOLDER"; then
    SKIPPED+=("$key  (placeholder value; leave it empty instead)")
    skipped=$((skipped+1)); continue
  fi

  if [ "$key" = "NEXT_PUBLIC_SITE_URL" ] \
     && printf '%s' "$value" | grep -qE 'localhost|127\.0\.0\.1'; then
    SKIPPED+=("$key  (localhost; empty lets Vercel use the deployment URL)")
    skipped=$((skipped+1)); continue
  fi

  if is_secret "$key"; then kind=encrypted; else kind=plain; fi

  body="{\"key\":$(json_escape "$key"),\"value\":$(json_escape "$value"),\"type\":\"$kind\",\"target\":$TARGETS}"
  resp=$(curl -sS -X POST "https://api.vercel.com/v10/projects/$PROJECT/env?upsert=true" \
    -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$body")

  if printf '%s' "$resp" | grep -q '"created"'; then
    [ -z "$value" ] && shown="(empty)" || { is_secret "$key" && shown="(encrypted)" || shown="set"; }
    printf '  %-40s %-10s %s\n' "$key" "$kind" "$shown"
    pushed=$((pushed+1))
  else
    printf '  %-40s FAILED  %s\n' "$key" "$(printf '%s' "$resp" | head -c 140)"
    failed=$((failed+1))
  fi
done < "$FILE"

echo
echo "pushed $pushed, skipped $skipped, failed $failed"
if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo
  echo "Not pushed on purpose:"
  for s in "${SKIPPED[@]}"; do echo "  - $s"; done
fi
[ "$failed" -eq 0 ] || exit 1
