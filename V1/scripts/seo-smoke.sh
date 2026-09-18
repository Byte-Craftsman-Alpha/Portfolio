#!/usr/bin/env bash
# Aditya Chaudhari Spoke Portfolio — SEO Smoke Test
set -euo pipefail

TARGET="${1:-https://aditya.teamparadox.in}"
echo "=========================================================="
echo " Running SEO Smoke Tests against: $TARGET"
echo "=========================================================="

FAILED=0

# Check 200/308
tmp_file=$(mktemp)
http_code=$(curl -sL --max-time 15 -w "%{http_code}" -o "$tmp_file" "$TARGET/" 2>/dev/null || true)
http_code="${http_code: -3}"

if [[ "$http_code" != "200" ]]; then
  echo "❌ FAILED (HTTP Status $http_code)"
  FAILED=$((FAILED + 1))
else
  echo "✅ HTTP 200 OK"
fi

# Check canonical
if grep -qi 'rel="canonical"[^>]*href="https://aditya\.teamparadox\.in' "$tmp_file"; then
  echo "✅ Canonical self-referencing OK"
else
  echo "❌ FAILED (Missing or wrong self-canonical tag)"
  FAILED=$((FAILED + 1))
fi

# Check JSON-LD
if grep -qi 'application/ld+json' "$tmp_file" && grep -qi 'Person' "$tmp_file"; then
  echo "✅ JSON-LD Person schema OK"
else
  echo "❌ FAILED (Missing Person JSON-LD schema)"
  FAILED=$((FAILED + 1))
fi

# Check H1 in first HTML byte (No empty root shell)
if grep -qi '<h1[^>]*>.*Aditya Chaudhari' "$tmp_file" || (grep -qi '<h1' "$tmp_file" && grep -qi 'Aditya Chaudhari' "$tmp_file"); then
  echo "✅ H1 'Aditya Chaudhari' in raw HTML OK"
else
  echo "❌ FAILED (H1 not present in raw server HTML)"
  FAILED=$((FAILED + 1))
fi

# Check robots.txt
echo -n "Testing robots.txt ... "
robots=$(curl -sL --max-time 10 "${TARGET}/robots.txt" || true)
if echo "$robots" | grep -qi "Sitemap: https://aditya.teamparadox.in/sitemap.xml" && echo "$robots" | grep -qi "Googlebot"; then
  echo "✅ OK"
else
  echo "❌ FAILED (robots.txt missing or wrong)"
  FAILED=$((FAILED + 1))
fi

# Check sitemap.xml
echo -n "Testing sitemap.xml ... "
sitemap=$(curl -sL --max-time 10 "${TARGET}/sitemap.xml" || true)
if echo "$sitemap" | grep -qi "https://aditya.teamparadox.in/"; then
  echo "✅ OK"
else
  echo "❌ FAILED (sitemap.xml missing or wrong)"
  FAILED=$((FAILED + 1))
fi

# Check llms.txt
echo -n "Testing llms.txt ... "
llms=$(curl -sL --max-time 10 "${TARGET}/llms.txt" || true)
if echo "$llms" | grep -qi "Aditya Chaudhari" && echo "$llms" | grep -qi "Team Paradox"; then
  echo "✅ OK"
else
  echo "❌ FAILED (llms.txt missing or wrong)"
  FAILED=$((FAILED + 1))
fi

# Check OG image
echo -n "Testing og-image.png ... "
og_code=$(curl -sI --max-time 10 "${TARGET}/og-image.png" 2>/dev/null | grep -i "^HTTP" | awk '{print $2}' || echo "000")
if [[ "$og_code" == "200" ]]; then
  echo "✅ OK (200)"
else
  echo "❌ FAILED (Status $og_code)"
  FAILED=$((FAILED + 1))
fi

rm -f "$tmp_file"

echo "=========================================================="
if [[ $FAILED -eq 0 ]]; then
  echo "🎉 All Aditya Portfolio SEO smoke tests passed!"
  exit 0
else
  echo "💥 $FAILED tests failed."
  exit 1
fi
