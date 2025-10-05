#!/bin/bash

# Fix NextAuth v5 imports in all files

echo "🔧 Fixing NextAuth v5 imports..."

# Find all files using getServerSession
files=$(grep -r "getServerSession" src --include="*.ts" --include="*.tsx" -l)

for file in $files; do
  echo "Fixing: $file"

  # Replace import statement
  sed -i 's/import { getServerSession } from "next-auth"/import { auth } from "@\/lib\/auth"/g' "$file"
  sed -i "s/import { getServerSession } from 'next-auth'/import { auth } from '@\/lib\/auth'/g" "$file"

  # Remove authOptions import if it exists and getServerSession was used
  sed -i '/import.*authOptions.*from.*@\/lib\/auth/d' "$file"

  # Replace getServerSession(authOptions) with auth()
  sed -i 's/const session = await getServerSession(authOptions)/const session = await auth()/g' "$file"
  sed -i 's/const session = getServerSession(authOptions)/const session = auth()/g' "$file"
  sed -i 's/await getServerSession(authOptions)/await auth()/g' "$file"
  sed -i 's/getServerSession(authOptions)/auth()/g' "$file"
done

echo "✅ NextAuth v5 imports fixed!"
